import { useCallback, useState } from "react";

interface AlertConfig {
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

export function useAlertModal() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: "",
    message: "",
  });

  const showAlert = useCallback((alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  // 로그인 실패 알림 프리셋
  const showLoginFailedAlert = useCallback(
    (onRetry?: () => void) => {
      showAlert({
        title: "로그인이 실패했습니다",
        message: "위 에러에 대한 설명 혹은\n대처방안과 관련된 내용",
        primaryButtonText: "로그인 하러가기",
        onPrimaryPress: () => {
          hideAlert();
          onRetry?.();
        },
      });
    },
    [showAlert, hideAlert]
  );

  // 네트워크 에러 알림 프리셋
  const showNetworkErrorAlert = useCallback(
    (onRetry?: () => void) => {
      showAlert({
        title: "네트워크 오류",
        message: "인터넷 연결을 확인해주세요.",
        primaryButtonText: "다시 시도",
        onPrimaryPress: () => {
          hideAlert();
          onRetry?.();
        },
      });
    },
    [showAlert, hideAlert]
  );

  // 일반 에러 알림 프리셋
  const showErrorAlert = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        primaryButtonText: "확인",
        onPrimaryPress: () => {
          hideAlert();
          onConfirm?.();
        },
      });
    },
    [showAlert, hideAlert]
  );

  return {
    visible,
    config,
    showAlert,
    hideAlert,
    showLoginFailedAlert,
    showNetworkErrorAlert,
    showErrorAlert,
  };
}
