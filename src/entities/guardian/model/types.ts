// 보호자 기본 정보
export interface GuardianProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  phone: string;
  address?: string;
  addressDetail?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 보호자 등록 폼 데이터
export interface GuardianRegistrationForm {
  name: string;
  birthDate: string;
  gender: "male" | "female" | null;
  phone: string;
  address?: string;
  addressDetail?: string;
}

// 환자 정보 (보호자가 등록)
export interface PatientInfo {
  id: string;
  guardianId: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  relationship: PatientRelationship;
  careLevel?: CareLevel; // 장기요양등급
  diseases?: string[];
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// 환자와의 관계
export type PatientRelationship =
  | "parent" // 부모
  | "spouse" // 배우자
  | "child" // 자녀
  | "sibling" // 형제자매
  | "grandparent" // 조부모
  | "relative" // 친척
  | "other"; // 기타

// 장기요양등급
export type CareLevel = "1" | "2" | "3" | "4" | "5" | "cognitive"; // 인지지원등급
