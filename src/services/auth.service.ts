/**
 * Auth Service
 * 인증 관련 API 호출을 담당합니다.
 */
export const AuthService = {
    /**
     * 인증번호 전송 (Mock)
     * @param phoneNumber 휴대폰 번호
     * @returns 성공 여부
     */
    sendVerificationCode: async (phoneNumber: string): Promise<boolean> => {
        console.log(`[AuthService] Sending verification code to ${phoneNumber}`);

        // 네트워크 지연 시뮬레이션 (1초)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 성공 시뮬레이션
        return true;
    },

    /**
     * 인증번호 확인 (Mock)
     * @param phoneNumber 휴대폰 번호
     * @param code 인증번호
     * @returns 성공 여부
     */
    verifyCode: async (phoneNumber: string, code: string): Promise<boolean> => {
        console.log(`[AuthService] Verifying code ${code} for ${phoneNumber}`);

        // 네트워크 지연 시뮬레이션 (1초)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // "123456"을 올바른 코드로 가정
        return code === "123456";
    },

    /**
     * 가입 여부 확인 (Mock)
     * @param phoneNumber 휴대폰 번호
     * @returns 가입 여부
     */
    checkUserExists: async (phoneNumber: string): Promise<boolean> => {
        console.log(`[AuthService] Checking if user exists: ${phoneNumber}`);

        // 네트워크 지연 시뮬레이션 (0.5초)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // "01000000000"인 경우 이미 가입된 회원으로 간주
        return phoneNumber === "01000000000";
    },
};
