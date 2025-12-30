import { create } from "zustand";

export type UiGender = "male" | "female";

export type UiMobility = "independent" | "assistance" | "total";
export type UiAssistiveDevice = "none" | "cane" | "wheelchair";

export type CareType = "HOSPITAL" | "HOME" | "NURSING_HOME";
export type PreferredGender = "NONE" | "MALE" | "FEMALE";

export interface PatientBasicDraft {
  relationship?: string;
  name: string;
  birthDateYmd8: string; // YYYYMMDD
  gender: UiGender;
  height?: string;
  weight?: string;
}

export interface PatientConditionDraft {
  diagnosis?: string;
  mobility: UiMobility;
  assistiveDevice?: UiAssistiveDevice;
  otherAssistiveDevice?: string;
  notes?: string;
}

export interface CareRequestDraft {
  careType: CareType;
  startDateYmd: string; // YYYY-MM-DD
  endDateYmd: string; // YYYY-MM-DD
  location: string;
  requirements?: string;
  dailyRate?: string; // numeric string
  preferredCaregiverGender?: PreferredGender;
}

interface GuardianCareRequestState {
  patientBasic: PatientBasicDraft | null;
  patientCondition: PatientConditionDraft | null;
  careRequest: CareRequestDraft | null;
  setPatientBasic: (draft: PatientBasicDraft) => void;
  setPatientCondition: (draft: PatientConditionDraft) => void;
  setCareRequest: (draft: CareRequestDraft) => void;
  resetAll: () => void;
}

export const useGuardianCareRequestStore = create<GuardianCareRequestState>(
  (set) => ({
    patientBasic: null,
    patientCondition: null,
    careRequest: null,
    setPatientBasic: (draft) => set({ patientBasic: draft }),
    setPatientCondition: (draft) => set({ patientCondition: draft }),
    setCareRequest: (draft) => set({ careRequest: draft }),
    resetAll: () =>
      set({ patientBasic: null, patientCondition: null, careRequest: null }),
  })
);


