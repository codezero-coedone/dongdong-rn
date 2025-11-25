// 간병인 기본 정보
export interface CaregiverProfile {
  id: string;
  name: string;
  birthDate: string; // YYYYMMDD
  gender: "male" | "female";
  phone: string;
  address: string;
  addressDetail: string;
  idCardImageUrl?: string;
  criminalRecordUrl?: string; // 선택
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 간병인 등록 폼 데이터
export interface CaregiverRegistrationForm {
  name: string;
  birthDate: string;
  gender: "male" | "female" | null;
  phone: string;
  address: string;
  addressDetail: string;
  idCardImage?: string; // local uri
  criminalRecord?: string; // local uri (선택)
}

// 간병인 자격/경력 정보
export interface CaregiverQualification {
  id: string;
  caregiverId: string;
  certificateName: string;
  certificateNumber?: string;
  issuedAt?: string;
  expiresAt?: string;
  imageUrl?: string;
}

// 간병인 경력
export interface CaregiverExperience {
  id: string;
  caregiverId: string;
  workplace: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

// 간병인 상태
export type CaregiverStatus =
  | "pending" // 심사 대기
  | "approved" // 승인됨
  | "rejected" // 거절됨
  | "suspended"; // 정지됨
