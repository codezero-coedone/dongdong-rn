import { STORAGE_KEYS } from "@/shared/constants/storage";
import { secureStorage } from "@/shared/lib/storage/secureStorage";
import type { AppLocale } from "@/shared/ui/LanguagePickerModal";

export async function getAppLocale(): Promise<AppLocale> {
  try {
    const v = await secureStorage.get(STORAGE_KEYS.LANGUAGE);
    return v === "en" ? "en" : "ko";
  } catch {
    return "ko";
  }
}

export async function setAppLocale(v: AppLocale): Promise<void> {
  try {
    await secureStorage.set(STORAGE_KEYS.LANGUAGE, v);
  } catch {
    // ignore
  }
}

