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
  yearOfStudy?: number;
  hostelType?: string;
  quota?: string;
  preferredHostel?: string;
  totalFeePaid?: number;
  remainingFeeDue?: number;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  gender: string;
  address: string;
  user?: User;
  applications?: Application[];
}

export interface AdmissionQuotaOption {
  id: string;
  name: string;
  description: string;
}

export const ADMISSION_QUOTAS: AdmissionQuotaOption[] = [
  { id: 'TNEA', name: 'TNEA (includes sports, 7.5% etc..)', description: 'Tamil Nadu Engineering Admissions General & Special Quotas' },
  { id: 'OTHER_STATES', name: 'Other States', description: 'All India & Other States Quota' },
  { id: 'NRI', name: 'NRI', description: 'Non-Resident Indian Ward Admission Quota' },
  { id: 'FOREIGN_NATIONALS', name: 'Foreign Nationals', description: 'International & Foreign Nationals Quota' },
  { id: 'FOUNDERS_QUOTA', name: 'Founders Quota', description: 'Institutional Trust & Founders Allocation' },
  { id: 'CONSORTIUM_OF_INDUSTRIES', name: 'Consortium Of Industries', description: 'Industrial Consortium Sponsored Quota' },
];

export interface HostelOption {
  id: string;
  name: string;
  fee: number;
  feeFormatted: string;
  features: string;
}

export const isSpecialHostel = (hostelCode?: string | null): 'ORCHID' | 'RAJAM_NRI' | 'GENERAL' => {
  if (!hostelCode) return 'GENERAL';
  const code = hostelCode.toUpperCase();
  if (code.includes('ORCHID')) return 'ORCHID';
  if (code.includes('RAJAM')) return 'RAJAM_NRI';
  return 'GENERAL';
};

export const getHostelFee = (yearOfStudy: number = 1, hostelCode?: string | null): number => {
  const specialType = isSpecialHostel(hostelCode);
  const isFirstYear = yearOfStudy === 1;

  if (isFirstYear) {
    if (specialType === 'ORCHID') return 140735;
    if (specialType === 'RAJAM_NRI') return 107084;
    return 47197; // General Hostel
  } else {
    // 2nd, 3rd, Final Year
    if (specialType === 'ORCHID') return 124735;
    if (specialType === 'RAJAM_NRI') return 96084;
    return 40797; // General Hostel
  }
};

export const calculateFeeDifference = (
  yearOfStudy: number = 1,
  fromHostelCode: string | null | undefined,
  toHostelCode: string | null | undefined,
  alreadyPaidAmount: number = 0
) => {
  const currentFee = getHostelFee(yearOfStudy, fromHostelCode);
  const newFee = getHostelFee(yearOfStudy, toHostelCode);

  const fromType = isSpecialHostel(fromHostelCode);
  const toType = isSpecialHostel(toHostelCode);

  if (fromType === 'GENERAL' && toType === 'GENERAL') {
    return {
      currentFee,
      newFee,
      alreadyPaid: alreadyPaidAmount,
      remainingDue: 0,
      isDifferenceApplicable: false,
    };
  }

  const effectivePaid = alreadyPaidAmount > 0 ? alreadyPaidAmount : currentFee;
  const rawDiff = newFee - effectivePaid;
  const remainingDue = rawDiff > 0 ? rawDiff : 0;

  return {
    currentFee,
    newFee,
    alreadyPaid: effectivePaid,
    remainingDue,
    isDifferenceApplicable: remainingDue > 0,
  };
};

export const BOYS_HOSTELS: HostelOption[] = [
  { id: 'ORCHID', name: 'Orchid International', fee: 140735, feeFormatted: '₹1,40,735', features: 'Air Conditioned • Premium International Complex' },
  { id: 'BIRLA', name: 'Birla', fee: 47197, feeFormatted: '₹47,197', features: 'General Residence • High-Speed LAN' },
  { id: 'BHAVANI', name: 'Bhavani', fee: 47197, feeFormatted: '₹47,197', features: 'General Residence • Campus Amenities' },
  { id: 'KURINJI', name: 'Kurinji', fee: 47197, feeFormatted: '₹47,197', features: 'General Residence • Modern Wing' },
  { id: 'MARUDHAM', name: 'Marudham', fee: 47197, feeFormatted: '₹47,197', features: 'General Residence • Eco Campus' },
  { id: 'THAMIRA', name: 'Thamira Bhavani', fee: 47197, feeFormatted: '₹47,197', features: 'General Residence • Academic Block' },
  { id: 'AMARAVATHI', name: 'Amaravathi', fee: 47197, feeFormatted: '₹47,197', features: 'General Residence • First Year Block' },
];

export const GIRLS_HOSTELS: HostelOption[] = [
  { id: 'RAJAM_NRI', name: 'Rajam NRI', fee: 107084, feeFormatted: '₹1,07,084', features: 'Air Conditioned • Premier NRI Complex' },
  { id: 'PONNI', name: 'Ponni', fee: 47197, feeFormatted: '₹47,197', features: '4-Sharing Quad Residence • Central Courtyard' },
  { id: 'CAUVERY', name: 'Cauvery', fee: 47197, feeFormatted: '₹47,197', features: '4-Sharing Quad Residence • High-Speed Wi-Fi' },
  { id: 'VAIGAI', name: 'Vaigai', fee: 47197, feeFormatted: '₹47,197', features: '5-Sharing Residence • Garden Proximity' },
];

export const getHostelPreferenceDetails = (gender: string, hostelId?: string, year: number = 1): HostelOption => {
  const list = gender === 'FEMALE' ? GIRLS_HOSTELS : BOYS_HOSTELS;
  const match = list.find((h) => h.id === hostelId) || list[0];
  const fee = getHostelFee(year, match.id);
  return {
    ...match,
    fee,
    feeFormatted: `₹${fee.toLocaleString('en-IN')}`,
  };
};

export interface HostelTypeOption {
  id: string;
  name: string;
  fee: number;
  feeFormatted: string;
  features: string;
  description: string;
}

export const HOSTEL_TYPES: HostelTypeOption[] = [
  {
    id: 'REGULAR_NON_AC',
    name: 'Standard Non-AC (Sharing)',
    fee: 45000,
    feeFormatted: '₹45,000',
    features: '2/4-Sharing • Shared Bath • Mess Included',
    description: 'Standard residential sharing room with mess and standard amenities included.',
  },
  {
    id: 'DELUXE_NON_AC',
    name: 'Deluxe Non-AC (Attached Bath)',
    fee: 65000,
    feeFormatted: '₹65,000',
    features: '2-Sharing • Attached Bathroom • High-Speed Wi-Fi',
    description: 'Comfortable double occupancy room with private attached washroom and dedicated study desks.',
  },
  {
    id: 'AC_SHARED',
    name: 'Deluxe AC (Shared)',
    fee: 85000,
    feeFormatted: '₹85,000',
    features: '2-Sharing • Climate Controlled AC • Attached Bath',
    description: 'Air-conditioned double sharing room with attached bath, 24/7 power backup, and mess privileges.',
  },
  {
    id: 'AC_SINGLE',
    name: 'Premium AC (Single Occupancy)',
    fee: 115000,
    feeFormatted: '₹1,15,000',
    features: 'Single Private Room • AC • Attached Bath • Premium Amenities',
    description: 'Private single air-conditioned suite with dedicated workspace and exclusive amenities.',
  },
];

export const getHostelTypeDetails = (type?: string): HostelTypeOption => {
  return HOSTEL_TYPES.find((h) => h.id === type) || HOSTEL_TYPES[0];
};

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
  gender?: string;
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
