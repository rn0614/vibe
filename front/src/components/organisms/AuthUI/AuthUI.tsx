import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/shared/api";
import styles from "./AuthUI.module.scss";

export interface AuthUIProps {
  view?: "sign_in" | "sign_up" | "forgotten_password";
  className?: string;
}

export const AuthUI: React.FC<AuthUIProps> = ({
  view = "sign_in",
}) => {
  return (
    <Auth
      supabaseClient={supabase}
      view={view}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: "var(--color-primary)",
              brandAccent: "var(--color-primary-dark)",
              brandButtonText: "white",
              defaultButtonBackground: "var(--color-gray-100)",
              defaultButtonBackgroundHover: "var(--color-gray-200)",
              defaultButtonBorder: "var(--color-gray-300)",
              defaultButtonText: "var(--color-gray-700)",
              dividerBackground: "var(--color-gray-200)",
              inputBackground: "var(--color-white)",
              inputBorder: "var(--color-gray-300)",
              inputBorderFocus: "var(--color-primary)",
              inputBorderHover: "var(--color-gray-400)",
              inputText: "var(--color-gray-900)",
              inputLabelText: "var(--color-gray-700)",
              inputPlaceholder: "var(--color-gray-500)",
              messageText: "var(--color-gray-700)",
              messageTextDanger: "var(--color-error)",
              anchorTextColor: "var(--color-primary)",
              anchorTextHoverColor: "var(--color-primary-dark)",
            },
            space: {
              inputPadding: "var(--spacing-3)",
              buttonPadding: "var(--spacing-3) var(--spacing-4)",
            },
            fontSizes: {
              baseBodySize: "var(--font-size-sm)",
              baseInputSize: "var(--font-size-base)",
              baseLabelSize: "var(--font-size-sm)",
              baseButtonSize: "var(--font-size-base)",
            },
            fonts: {
              bodyFontFamily: "var(--font-family)",
              buttonFontFamily: "var(--font-family)",
              inputFontFamily: "var(--font-family)",
              labelFontFamily: "var(--font-family)",
            },
            borderWidths: {
              buttonBorderWidth: "1px",
              inputBorderWidth: "1px",
            },
            radii: {
              borderRadiusButton: "var(--border-radius)",
            },
          },
        },
        className: {
          container: '', // 카드 스타일링 제거
          button: styles.authButton,
          input: styles.authInput,
          label: styles.authLabel,
          message: styles.authMessage,
          divider: styles.authDivider,
        },
      }}
      theme="default"
      providers={["google"]} /*, "github", "facebook" */
      onlyThirdPartyProviders={true}
      localization={{
        variables: {
          sign_in: {
            email_label: "이메일",
            password_label: "비밀번호",
            email_input_placeholder: "example@email.com",
            password_input_placeholder: "비밀번호를 입력하세요",
            button_label: "로그인",
            loading_button_label: "로그인 중...",
            social_provider_text: "{{provider}}로 로그인",
            link_text: "이미 계정이 있으신가요? 로그인",
          },
          sign_up: {
            email_label: "이메일",
            password_label: "비밀번호",
            email_input_placeholder: "example@email.com",
            password_input_placeholder: "비밀번호를 입력하세요",
            button_label: "회원가입",
            loading_button_label: "계정 생성 중...",
            social_provider_text: "{{provider}}로 회원가입",
            link_text: "계정이 없으신가요? 회원가입",
            confirmation_text: "이메일로 전송된 링크를 확인하세요",
          },
          forgotten_password: {
            email_label: "이메일",
            password_label: "비밀번호",
            email_input_placeholder: "등록된 이메일을 입력하세요",
            button_label: "비밀번호 재설정 이메일 전송",
            loading_button_label: "전송 중...",
            link_text: "비밀번호를 잊으셨나요?",
            confirmation_text: "비밀번호 재설정 링크를 이메일로 전송했습니다",
          },
        },
      }}
    />
  );
};
