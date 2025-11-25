import { create } from "zustand";

// 기본 정보
interface BasicInfo {
  name: string;
  birthDate: string;
  gender: "male" | "female" | null;
  phone: string;
  address: string;
  addressDetail: string;
  idCardImage?: string;
  criminalRecord?: string;
}

// 자격증 및 경력
interface QualificationInfo {
  certificates: string[];
  certificateImages: Record<string, string>;
  experience: "newcomer" | "experienced" | null;
  experienceYears: string;
  experienceMonths: string;
  experienceDescription: string;
  experienceDuties: string;
}

// 희망 근무 환경
interface WorkPreference {
  locations: { id: string; label: string }[];
  workDays: string[];
  startTime: string | null;
  endTime: string | null;
  timeOptions: string[];
  introduction: string;
}

// 전체 등록 상태
interface CaregiverRegistrationState {
  // 현재 단계
  currentStep: number;

  // 각 단계 데이터
  basicInfo: BasicInfo;
  qualification: QualificationInfo;
  workPreference: WorkPreference;

  // 액션
  setCurrentStep: (step: number) => void;
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  updateQualification: (data: Partial<QualificationInfo>) => void;
  updateWorkPreference: (data: Partial<WorkPreference>) => void;
  resetRegistration: () => void;
  isStepValid: (step: number) => boolean;
}

const initialBasicInfo: BasicInfo = {
  name: "",
  birthDate: "",
  gender: null,
  phone: "",
  address: "",
  addressDetail: "",
  idCardImage: undefined,
  criminalRecord: undefined,
};

const initialQualification: QualificationInfo = {
  certificates: [],
  certificateImages: {},
  experience: null,
  experienceYears: "",
  experienceMonths: "",
  experienceDescription: "",
  experienceDuties: "",
};

const initialWorkPreference: WorkPreference = {
  locations: [],
  workDays: [],
  startTime: null,
  endTime: null,
  timeOptions: [],
  introduction: "",
};

export const useCaregiverRegistrationStore = create<CaregiverRegistrationState>(
  (set, get) => ({
    currentStep: 1,
    basicInfo: initialBasicInfo,
    qualification: initialQualification,
    workPreference: initialWorkPreference,

    setCurrentStep: (step) => set({ currentStep: step }),

    updateBasicInfo: (data) =>
      set((state) => ({
        basicInfo: { ...state.basicInfo, ...data },
      })),

    updateQualification: (data) =>
      set((state) => ({
        qualification: { ...state.qualification, ...data },
      })),

    updateWorkPreference: (data) =>
      set((state) => ({
        workPreference: { ...state.workPreference, ...data },
      })),

    resetRegistration: () =>
      set({
        currentStep: 1,
        basicInfo: initialBasicInfo,
        qualification: initialQualification,
        workPreference: initialWorkPreference,
      }),

    isStepValid: (step) => {
      const { basicInfo, qualification, workPreference } = get();

      switch (step) {
        case 1: // 기본 정보
          return (
            basicInfo.name.length > 0 &&
            basicInfo.birthDate.length === 8 &&
            basicInfo.gender !== null &&
            basicInfo.phone.length === 13 &&
            basicInfo.address.length > 0 &&
            basicInfo.idCardImage !== undefined
          );

        case 2: // 자격증 및 경력
          return (
            qualification.certificates.length > 0 &&
            qualification.experience !== null
          );

        case 3: // 희망 근무 환경
          return (
            workPreference.locations.length > 0 &&
            workPreference.workDays.length > 0 &&
            (workPreference.timeOptions.length > 0 ||
              (workPreference.startTime !== null &&
                workPreference.endTime !== null))
          );

        default:
          return false;
      }
    },
  })
);
