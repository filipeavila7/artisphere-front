import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";

import Button from "../../components/button/Button";
import AuthShowcase from "../../components/auth/AuthShowcase";
import FormField from "../../components/auth/FormField";
import PasswordStrength from "../../components/auth/PasswordStrength";
import {
  MIN_PASSWORD_LENGTH,
  getApiErrorMessage,
} from "../../utils/authValidation";

// ajuste os caminhos conforme o seu projeto
import { resetPassword } from "../../service/password-reset/PasswordResetService";
import type { ResetPasswordRequest } from "../../types/passsword-reset/passwordResetType";

import logo from "../../assets/logo.png";
import "../../styles/login.css";
import "../../styles/register.css";
import "../../styles/password-reset.css";

type FieldName = "password" | "confirmPassword";

type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `At least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match.";
  }

  return errors;
}

/*
 * O backend responde "Token inválido" / "Token expirado"
 * via RuntimeException, então detectamos pelo texto
 * (ou por 404/410, caso você troque por exceções com status).
 */
function isTokenError(error: unknown): boolean {
  if (
    isAxiosError(error) &&
    (error.response?.status === 404 || error.response?.status === 410)
  ) {
    return true;
  }

  return /token|expirad|inv[aá]lid/i.test(getApiErrorMessage(error) ?? "");
}

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [values, setValues] = useState<FormValues>({
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  const resetMutation = useMutation({
    mutationFn: (request: ResetPasswordRequest) => resetPassword(request),

    onSuccess: () => setIsSuccess(true),

    onError: (error) => {
      if (isTokenError(error)) {
        setIsTokenInvalid(true);
      }
    },
  });

  const errors = useMemo(() => validate(values), [values]);

  // depois de trocar a senha, vai pro login sozinho
  useEffect(() => {
    if (!isSuccess) return;

    const timer = window.setTimeout(() => navigate("/login"), 2500);

    return () => window.clearTimeout(timer);
  }, [isSuccess, navigate]);

  const handleChange =
    (field: FieldName) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setValues((current) => ({ ...current, [field]: value }));
    };

  const handleBlur = (field: FieldName) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const getError = (field: FieldName) =>
    touched[field] ? errors[field] : undefined;

  const isValid = (field: FieldName) =>
    touched[field] && !errors[field] && values[field].length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({ password: true, confirmPassword: true });

    if (Object.keys(errors).length > 0 || resetMutation.isPending) {
      return;
    }

    resetMutation.mutate({
      token,
      novaSenha: values.password,
    });
  }

  const passwordToggle = (
    <button
      type="button"
      className="toggle-password"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  );

  const showTokenInvalid = !token || isTokenInvalid;

  return (
    <div className="login-lay">
      <AuthShowcase />

      <section className="login-box-right">
        {/* só aparece no mobile, quando o painel roxo some */}
        <div className="brand brand-mobile">
          <img src={logo} alt="Artisphere logo" className="brand-logo" />
          <span className="brand-name">Artisphere</span>
        </div>

        {isSuccess ? (
          /* ================= SENHA ALTERADA ================= */
          <div className="login-box register-box register-success">
            <svg className="success-check" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="success-circle" cx="26" cy="26" r="24" />
              <path className="success-tick" d="M14 27l8 8 16-18" />
            </svg>

            <h2>Password updated!</h2>

            <p>
              You can now log in with your new password. Taking you to the
              login...
            </p>

            <Button type="button" onClick={() => navigate("/login")}>
              Go to login
            </Button>
          </div>
        ) : showTokenInvalid ? (
          /* ================= LINK INVÁLIDO / EXPIRADO ================= */
          <div className="login-box register-box register-success">
            <div className="state-icon warning">
              <FaExclamationTriangle />
            </div>

            <h2>Link expired or invalid</h2>

            <p>
              This reset link can’t be used anymore. Reset links expire after
              15 minutes and work only once.
            </p>

            <Button type="button" onClick={() => navigate("/forgot-password")}>
              Request a new link
            </Button>

            <div className="state-links">
              <button
                type="button"
                className="link-btn strong"
                onClick={() => navigate("/login")}
              >
                Back to login
              </button>
            </div>
          </div>
        ) : (
          /* ================= FORMULÁRIO ================= */
          <>
            <div className="login-heading">
              <h1>New password</h1>
              <p>Choose a strong password for your account</p>
            </div>

            <div className="login-box register-box">
              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <FormField
                  index={0}
                  id="password"
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  error={getError("password")}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  trailing={passwordToggle}
                >
                  <PasswordStrength password={values.password} />
                </FormField>

                <FormField
                  index={1}
                  id="confirmPassword"
                  label="Confirm new password"
                  type={showPassword ? "text" : "password"}
                  value={values.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  error={getError("confirmPassword")}
                  showValid={isValid("confirmPassword")}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />

                {resetMutation.isError && !isTokenInvalid && (
                  <p className="login-error" role="alert">
                    Couldn't reset your password. Please try again.
                  </p>
                )}

                <div className="btn-login-box">
                  <Button type="submit" disabled={resetMutation.isPending}>
                    {resetMutation.isPending
                      ? "Saving..."
                      : "Reset password"}
                  </Button>
                </div>
              </form>

              <div className="line"></div>

              <div className="sign-box">
                <button
                  type="button"
                  className="link-btn strong"
                  onClick={() => navigate("/login")}
                >
                  Back to login
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default ResetPassword;