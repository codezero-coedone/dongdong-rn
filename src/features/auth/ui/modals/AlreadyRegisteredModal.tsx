import { AlertModal } from "@/shared/ui/AlertModal";

interface AlreadyRegisteredModalProps {
    visible: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export function AlreadyRegisteredModal({
    visible,
    onClose,
    onLogin,
}: AlreadyRegisteredModalProps) {
    return (
        <AlertModal
            visible={visible}
            title="이미 가입된 회원"
            message={`이미 가입된 회원정보입니다.\n로그인을 진행해주세요.`}
            primaryButtonText="로그인 하러가기"
            onPrimaryPress={onLogin}
            onClose={onClose}
        />
    );
}
