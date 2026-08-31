// MIT Institutional Hostel Fee Engine

export const isSpecialHostel = (hostelCode?: string | null): 'ORCHID' | 'RAJAM_NRI' | 'GENERAL' => {
  if (!hostelCode) return 'GENERAL';
  const code = hostelCode.toUpperCase();
  if (code.includes('ORCHID')) return 'ORCHID';
  if (code.includes('RAJAM')) return 'RAJAM_NRI';
  return 'GENERAL';
};

export const getHostelFee = (yearOfStudy: number, hostelCode?: string | null): number => {
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

export interface FeeCalculationResult {
  currentFee: number;
  newFee: number;
  alreadyPaid: number;
  remainingDue: number;
  isDifferenceApplicable: boolean;
}

export const calculateFeeDifference = (
  yearOfStudy: number,
  fromHostelCode: string | null | undefined,
  toHostelCode: string | null | undefined,
  alreadyPaidAmount: number
): FeeCalculationResult => {
  const currentFee = getHostelFee(yearOfStudy, fromHostelCode);
  const newFee = getHostelFee(yearOfStudy, toHostelCode);

  const fromType = isSpecialHostel(fromHostelCode);
  const toType = isSpecialHostel(toHostelCode);

  // If shifting between General Hostels (e.g. Birla to Kurinji, Ponni to Kaveri) -> No fee change
  if (fromType === 'GENERAL' && toType === 'GENERAL') {
    return {
      currentFee,
      newFee,
      alreadyPaid: alreadyPaidAmount,
      remainingDue: 0,
      isDifferenceApplicable: false,
    };
  }

  // If alreadyPaid is 0 or less than standard base, use current standard fee as paid baseline if already approved
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
