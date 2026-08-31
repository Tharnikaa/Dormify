import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/apiResponse';
import { logAudit } from '../utils/auditLogger';

export class HostelController {
  static async getHostels(req: Request, res: Response) {
    try {
      const hostels = await prisma.hostel.findMany({
        include: {
          blocks: {
            include: {
              floors: {
                include: {
                  rooms: {
                    include: {
                      beds: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return ApiResponse.success(res, hostels);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch hostels', 500, err);
    }
  }

  static async getBlocks(req: Request, res: Response) {
    try {
      const { hostelId, gender } = req.query;
      const where: any = {};
      if (hostelId) where.hostelId = hostelId as string;

      // If requested by a student, automatically restrict to their assigned hostel
      if (req.user?.role === 'STUDENT' && req.user.studentId) {
        const student = await prisma.studentProfile.findUnique({
          where: { id: req.user.studentId },
          select: { gender: true, preferredHostel: true },
        });

        if (student?.preferredHostel) {
          where.OR = [
            { code: `BLK-${student.preferredHostel}` },
            { hostel: { code: student.preferredHostel } },
            { hostel: { name: { contains: student.preferredHostel } } },
            { name: { contains: student.preferredHostel } },
          ];
        } else if (student?.gender) {
          const gen = student.gender.toUpperCase();
          where.OR = [
            { gender: gen },
            { gender: 'COED' },
            { name: { contains: gen === 'FEMALE' ? 'Women' : 'Men' } },
            { name: { contains: gen === 'FEMALE' ? 'Girls' : 'Boys' } },
          ];
        }
      } else if (gender) {
        const gen = (gender as string).toUpperCase();
        where.OR = [
          { gender: gen },
          { gender: 'COED' },
          { name: { contains: gen === 'FEMALE' ? 'Women' : 'Men' } },
          { name: { contains: gen === 'FEMALE' ? 'Girls' : 'Boys' } },
        ];
      }

      const blocks = await prisma.block.findMany({
        where,
        include: {
          hostel: true,
          floors: {
            include: {
              rooms: {
                include: {
                  beds: true,
                },
              },
            },
            orderBy: { floorNumber: 'asc' },
          },
        },
      });

      return ApiResponse.success(res, blocks);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch blocks', 500, err);
    }
  }

  static async getFloorPlan(req: Request, res: Response) {
    try {
      const { blockId, floorNumber } = req.query;

      if (!blockId) {
        return ApiResponse.error(res, 'blockId parameter is required', 400);
      }

      const floorNum = floorNumber ? parseInt(floorNumber as string, 10) : 1;

      const floor = await prisma.floor.findFirst({
        where: {
          blockId: blockId as string,
          floorNumber: floorNum,
        },
        include: {
          block: {
            include: {
              hostel: true,
            },
          },
          rooms: {
            include: {
              beds: {
                include: {
                  allocations: {
                    where: { status: 'ACTIVE' },
                    include: {
                      application: {
                        include: {
                          student: {
                            include: {
                              user: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                orderBy: { bedNumber: 'asc' },
              },
            },
            orderBy: { roomNumber: 'asc' },
          },
        },
      });

      if (!floor) {
        return ApiResponse.error(res, 'Floor plan not found for the specified block and floor number.', 404);
      }

      const mappedRooms = floor.rooms.map((room) => {
        const totalBeds = room.beds.length;
        const occupiedBeds = room.beds.filter((b) => b.status === 'OCCUPIED').length;
        const availableBeds = room.beds.filter((b) => b.status === 'AVAILABLE').length;

        let computedStatus = room.status;
        if (room.status !== 'MAINTENANCE' && room.status !== 'RESERVED') {
          if (occupiedBeds >= totalBeds && totalBeds > 0) computedStatus = 'FULL';
          else if (occupiedBeds > 0) computedStatus = 'PARTIALLY_OCCUPIED';
          else computedStatus = 'AVAILABLE';
        }

        return {
          ...room,
          status: computedStatus,
          totalBeds,
          occupiedBeds,
          availableBeds,
        };
      });

      return ApiResponse.success(res, {
        ...floor,
        rooms: mappedRooms,
      });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch floor plan', 500, err);
    }
  }

  static async updateRoomStatus(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { status } = req.body;

      const allowed = ['AVAILABLE', 'PARTIALLY_OCCUPIED', 'FULL', 'MAINTENANCE', 'RESERVED'];
      if (!allowed.includes(status)) {
        return ApiResponse.error(res, 'Invalid room status value', 400);
      }

      const room = await prisma.room.update({
        where: { id: roomId },
        data: { status },
      });

      if (status === 'MAINTENANCE') {
        await prisma.bed.updateMany({
          where: { roomId, status: 'AVAILABLE' },
          data: { status: 'MAINTENANCE' },
        });
      } else if (status === 'AVAILABLE') {
        await prisma.bed.updateMany({
          where: { roomId, status: 'MAINTENANCE' },
          data: { status: 'AVAILABLE' },
        });
      }

      await logAudit(
        req.user!.userId,
        'ROOM_STATUS_CHANGED',
        'Room',
        `Changed room ${room.roomNumber} status to ${status}`,
        room.id
      );

      return ApiResponse.success(res, room, 'Room status updated successfully');
    } catch (err) {
      return ApiResponse.error(res, 'Failed to update room status', 500, err);
    }
  }

  static async createRoom(req: Request, res: Response) {
    try {
      const { floorId, roomNumber, capacity, roomType } = req.body;

      if (!floorId || !roomNumber || !capacity) {
        return ApiResponse.error(res, 'floorId, roomNumber, and capacity are required', 400);
      }

      const cap = parseInt(capacity, 10);
      const room = await prisma.room.create({
        data: {
          floorId,
          roomNumber,
          capacity: cap,
          roomType: roomType || 'DOUBLE',
          status: 'AVAILABLE',
        },
      });

      const bedLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (let i = 0; i < cap; i++) {
        await prisma.bed.create({
          data: {
            roomId: room.id,
            bedNumber: bedLetters[i] || `${i + 1}`,
            status: 'AVAILABLE',
          },
        });
      }

      await logAudit(
        req.user!.userId,
        'ROOM_CREATED',
        'Room',
        `Created new room ${roomNumber} with capacity ${cap}`,
        room.id
      );

      return ApiResponse.success(res, room, 'Room created successfully', 201);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to create room', 500, err);
    }
  }
}
