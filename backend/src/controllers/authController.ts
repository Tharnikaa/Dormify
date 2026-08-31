import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { ApiResponse } from '../utils/apiResponse';
import { logAudit } from '../utils/auditLogger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, rollNumber, department, hostelType, quota, preferredHostel, phone, guardianName, guardianPhone, gender, address } = req.body;

      if (!name || !email || !password || !rollNumber) {
        return ApiResponse.error(res, 'Missing required registration fields (name, email, password, rollNumber)', 400);
      }

      // Check existing email
      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return ApiResponse.error(res, 'An account with this email address already exists.', 409);
      }

      // Check existing roll number
      const existingProfile = await prisma.studentProfile.findUnique({ where: { rollNumber } });
      if (existingProfile) {
        return ApiResponse.error(res, 'A student profile with this roll number already exists.', 409);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user & student profile
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          role: 'STUDENT',
          studentProfile: {
            create: {
              rollNumber,
              department: department || 'Computer Science & Engineering',
              hostelType: hostelType || 'REGULAR_NON_AC',
              quota: quota || 'TNEA',
              preferredHostel: preferredHostel || null,
              phone: phone || '',
              guardianName: guardianName || '',
              guardianPhone: guardianPhone || '',
              gender: gender || 'FEMALE',
              address: address || '',
            },
          },
        },
        include: {
          studentProfile: true,
        },
      });

      // Find active academic year & create initial application
      const activeAcademicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
      if (activeAcademicYear && user.studentProfile) {
        await prisma.application.create({
          data: {
            studentId: user.studentProfile.id,
            academicYearId: activeAcademicYear.id,
            status: 'PROFILE_COMPLETED',
          },
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          studentId: user.studentProfile?.id,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      await logAudit(user.id, 'STUDENT_REGISTERED', 'User', `Student ${user.name} (${rollNumber}) registered account.`, user.id);

      return ApiResponse.success(res, {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfile: user.studentProfile,
        },
      }, 'Registration successful', 201);
    } catch (err) {
      console.error('[AuthController.register] Error:', err);
      return ApiResponse.error(res, 'Registration failed', 500, err);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, rollNumber, identifier, password } = req.body;

      if (!password) {
        return ApiResponse.error(res, 'Password is required.', 400);
      }

      let user = null;

      // If both rollNumber and email are provided (Student 3-field login)
      if (rollNumber && email) {
        user = await prisma.user.findFirst({
          where: {
            email: email.trim().toLowerCase(),
            studentProfile: { rollNumber: rollNumber.trim() },
          },
          include: {
            studentProfile: true,
            adminProfile: true,
          },
        });

        if (!user) {
          return ApiResponse.error(res, 'Invalid Roll Number or Student Email combination.', 401);
        }
      } else {
        const loginKey = (identifier || email || rollNumber || '').trim();

        if (!loginKey) {
          return ApiResponse.error(res, 'Roll number or Email address is required.', 400);
        }

        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: loginKey.toLowerCase() },
              { studentProfile: { rollNumber: loginKey } },
            ],
          },
          include: {
            studentProfile: true,
            adminProfile: true,
          },
        });

        if (!user) {
          return ApiResponse.error(res, 'Invalid Roll Number or Email credentials.', 401);
        }
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return ApiResponse.error(res, 'Invalid password credentials.', 401);
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          studentId: user.studentProfile?.id,
          adminId: user.adminProfile?.id,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      await logAudit(user.id, 'LOGIN', 'User', `User ${user.name} logged in (${user.role}).`, user.id);

      return ApiResponse.success(res, {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfile: user.studentProfile,
          adminProfile: user.adminProfile,
        },
      }, 'Login successful');
    } catch (err) {
      console.error('[AuthController.login] Error:', err);
      return ApiResponse.error(res, 'Login failed', 500, err);
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          studentProfile: true,
          adminProfile: true,
        },
      });

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      return ApiResponse.success(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentProfile: user.studentProfile,
        adminProfile: user.adminProfile,
      });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch user session', 500, err);
    }
  }
}
