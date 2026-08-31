export type Role = 'STUDENT' | 'ADMIN' | 'HOD';

export type ApplicationStatus =
  | 'REGISTERED'
  | 'PROFILE_COMPLETED'
  | 'FEE_SUBMITTED'
  | 'FEE_VERIFIED'
  | 'ROOM_SELECTION'
  | 'ALLOCATED';

export type FeeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RoomStatus = 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE' | 'RESERVED';

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export type AllocationStatus = 'ACTIVE' | 'CANCELLED' | 'TRANSFERRED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentProfile?: StudentProfile;
  adminProfile?: AdminProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  department: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  gender: string;
  address: string;
  user?: User;
  applications?: Application[];
}

export interface AdminProfile {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  designation: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  academicYearId: string;
  status: ApplicationStatus;
  submittedAt: string;
  student?: StudentProfile;
  academicYear?: AcademicYear;
  feeReceipt?: FeeReceipt;
  allocation?: Allocation;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  gender: string;
  description?: string;
  blocks?: Block[];
}

export interface Block {
  id: string;
  hostelId: string;
  name: string;
  code: string;
  hostel?: Hostel;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  blockId: string;
  floorNumber: number;
  name: string;
  block?: Block;
  rooms?: Room[];
}

export interface Room {
  id: string;
  floorId: string;
  roomNumber: string;
  capacity: number;
  roomType: string;
  status: RoomStatus;
  floor?: Floor;
  totalBeds?: number;
  occupiedBeds?: number;
  availableBeds?: number;
  beds?: Bed[];
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: BedStatus;
  room?: Room;
  allocations?: Allocation[];
}

export interface FeeReceipt {
  id: string;
  applicationId: string;
  receiptNumber: string;
  amount: number;
  fileUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  submissionDate: string;
  status: FeeStatus;
  verificationDate?: string;
  reviewerAdminId?: string;
  rejectionReason?: string;
  application?: Application;
}

export interface Allocation {
  id: string;
  applicationId: string;
  bedId: string;
  academicYearId: string;
  allocationDate: string;
  status: AllocationStatus;
  allocatedBy: 'SELF' | 'ADMIN';
  reason?: string;
  letterRefCode: string;
  bed?: Bed;
  academicYear?: AcademicYear;
  application?: Application;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
  timestamp: string;
  actor?: User;
}

export interface AdminDashboardStats {
  activeAcademicYear: string;
  totalStudents: number;
  verifiedStudents: number;
  pendingVerification: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercentage: number;
  unallocatedStudents: number;
  recentAllocations: Allocation[];
  blockMetrics: {
    id: string;
    name: string;
    code: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
  }[];
}
