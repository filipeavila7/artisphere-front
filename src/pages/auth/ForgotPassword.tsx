import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FaArrowLeft, FaEnvelopeOpenText } from "react-icons/fa";

import Button from "../../components/button/Button";
import AuthShowcase from "../../components/auth/AuthShowcase";
import FormField from "../../components/auth/FormField";
import { useCountdown } from "../../hooks/useCountdown";
import { EMAIL_REGEX, getApiErrorMessage } from "../../utils/authValidation";

// ajuste os caminhos conforme o seu projeto
import {
  forgotPassword,
  resendResetToken,
} from "../../service/password-reset/PasswordResetService";
import type { ForgotPasswordRequest } from "../../types/passsword-reset/passwordResetType";

import logo from "../../assets/logo.png";
import "../../styles/login.css";
import "../../styles/register.css";
import "../../styles/password-reset.css";

// mesmo cooldown do backend (1 minuto)
const COOLDOWN_SECONDS = 60;

function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

/*
 * O backend responde ao cooldown com uma RuntimeException
 * ("Aguarde 1 minuto..." / "Espere 1 minuto..."), então
 * detectamos pelo status 429 ou pelo texto da mensagem.
 */
function isCooldownError(error: unknown): boolean {
  if (isAxiosError(error) && error.response?.status === 429) {
    return true;
  }

  return /aguarde|espere|wait/i.test(getApiErrorMessage(error) ?? "");
}

function getErrorMessage(error: unknown): string {
  if (isCooldownError(error)) {
    return "Please wait a minute before requesting another email.";
  }

  return "Couldn't send the email. Please try again.";
}

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { remaining, start } = useCountdown();

  const trimmedEmail = email.trim();

  const emailError = EMAIL_REGEX.test(trimmedEmail)
    ? undefined
    : "Enter a valid email.";

  const forgotMutation = useMutation({
    mutationFn: (request: ForgotPasswordRequest) => forgotPassword(request),

    onSuccess: (_data, variables) => {
      setSentTo(variables.email);
      start(COOLDOWN_SECONDS);
    },

    onError: (error, variables) => {
      /*
       * E-mail não cadastrado cai na MESMA tela de sucesso,
       * pra ninguém conseguir descobrir quais e-mails existem.
       */
      if (isNotFoundError(error)) {
        setSentTo(variables.email);
        start(COOLDOWN_SECONDS);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: (request: ForgotPasswordRequest) => resendResetToken(request),

    onSuccess: () => start(COOLDOWN_SECONDS),

    onError: (error) => {
      if (isNotFoundError(error) || isCooldownError(error)) {
        start(COOLDOWN_SECONDS);
      }
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched(true);

    if (emailError || forgotMutation.isPending) {
      return;
    }

    forgotMutation.mutate({ email: trimmedEmail });
  }

  function handleResend() {
    if (!sentTo || remaining > 0 || resendMutation.isPending) {
      return;
    }

    resendMutation.mutate({ email: sentTo });
  }

  function handleUseAnotherEmail() {
    setSentTo(null);
    forgotMutation.reset();
    resendMutation.reset();
  }

  const showForgotError =
    forgotMutation.isError && !isNotFoundError(forgotMutation.error);

  const showResendError =
    resendMutation.isError && !isNotFoundError(resendMutation.error);

  return (
    <div className="login-lay">
      <AuthShowcase />

      <section className="login-box-right">
        {/* só aparece no mobile, quando o painel roxo some */}
        <div className="brand brand-mobile">
          <img src={logo} alt="Artisphere logo" className="brand-logo" />
          <span className="brand-name">Artisphere</span>
        </div>

        {sentTo ? (
          /* ================= E-MAIL ENVIADO ================= */
          <div className="login-box register-box register-success">
            <div className="state-icon mail">
              <FaEnvelopeOpenText />
            </div>

            <h2>Check your email</h2>

            <p>
              If an account exists for <strong>{sentTo}</strong>, we sent a
              link to reset your password. It expires in 15 minutes.
            </p>

            <Button
              type="button"
              onClick={handleResend}
              disabled={remaining > 0 || resendMutation.isPending}
            >
              {resendMutation.isPending
                ? "Sending..."
                : remaining > 0
                  ? `Resend in ${remaining}s`
                  : "Resend email"}
            </Button>

            {resendMutation.isSuccess && remaining > 0 && (
              <p className="field-hint success">Email sent again.</p>
            )}

            {showResendError && (
              <p className="login-error" role="alert">
                {getErrorMessage(resendMutation.error)}
              </p>
            )}

            <small className="state-hint">
              Didn’t get it? Check your spam folder.
            </small>

            <div className="state-links">
              <button
                type="button"
                className="link-btn"
                onClick={handleUseAnotherEmail}
              >
                Use a different email
              </button>

              <button
                type="button"
                className="link-btn strong back-link"
                onClick={() => navigate("/login")}
              >
                <FaArrowLeft /> Back to login
              </button>
            </div>
          </div>
        ) : (
          /* ================= FORMULÁRIO ================= */
          <>
            <div className="login-heading">
              <h1>Forgot password?</h1>
              <p>Enter your email and we’ll send you a reset link</p>
            </div>

            <div className="login-box register-box">
              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <FormField
                  index={0}
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setTouched(true)}
                  error={touched ? emailError : undefined}
                  showValid={touched && !emailError}
                  autoComplete="email"
                  placeholder="you@email.com"
                />

                {showForgotError && (
                  <p className="login-error" role="alert">
                    {getErrorMessage(forgotMutation.error)}
                  </p>
                )}

                <div className="btn-login-box">
                  <Button type="submit" disabled={forgotMutation.isPending}>
                    {forgotMutation.isPending
                      ? "Sending..."
                      : "Send reset link"}
                  </Button>
                </div>
              </form>

              <div className="line"></div>

              <div className="sign-box">
                <button
                  type="button"
                  className="link-btn strong back-link"
                  onClick={() => navigate("/login")}
                >
                  <FaArrowLeft /> Back to login
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default ForgotPassword;