/**
 * Auth Service
 * 인증 관련 API 호출을 담당합니다.
 */
// NOTE:
// - AAB(Play) 기준에서는 실제 SMS 인증 플로우가 필요합니다.
// - Backend contract: POST /api/v1/sms/verification/request, /verify
const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://api.dongdong.io:3000/api/v1";

function onlyDigits(v: string): string {
    return String(v || "").replace(/\D/g, "");
}

async function postJson(path: string, body: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    // Some endpoints may return wrapped shapes; accept both.
    const data = (json && typeof json === "object" && (json as any).data) ? (json as any).data : json;
    if (!res.ok) {
        const msg = (data as any)?.message || (json as any)?.message || "SMS request failed";
        throw new Error(String(msg));
    }
    return data;
}

export const AuthService = {
    /**
     * 인증번호 전송
     * @param phoneNumber 휴대폰 번호
     * @returns 성공 여부
     */
    sendVerificationCode: async (phoneNumber: string): Promise<boolean> => {
        const digits = onlyDigits(phoneNumber);
        const data = await postJson("/sms/verification/request", { phoneNumber: digits });
        return Boolean((data as any)?.success);
    },

    /**
     * 인증번호 확인
     * @param phoneNumber 휴대폰 번호
     * @param code 인증번호
     * @returns 성공 여부
     */
    verifyCode: async (phoneNumber: string, code: string): Promise<boolean> => {
        const digits = onlyDigits(phoneNumber);
        const c = String(code || "").trim();
        const data = await postJson("/sms/verification/verify", { phoneNumber: digits, code: c });
        return Boolean((data as any)?.success);
    },

    /**
     * 가입 여부 확인
     * - Backend에 전용 엔드포인트가 없으면, "없다"로 처리(가입 플로우 차단 방지).
     * @param phoneNumber 휴대폰 번호
     * @returns 가입 여부
     */
    checkUserExists: async (phoneNumber: string): Promise<boolean> => {
        void phoneNumber;
        return false;
    },
};
