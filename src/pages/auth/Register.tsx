import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Button from "../../components/button/Button";
import AuthShowcase from "../../components/auth/AuthShowcase";
import FormField from "../../components/auth/FormField";
import PasswordStrength from "../../components/auth/PasswordStrength";
import { useDebounce } from "../../hooks/useDebounce";
import {
  EMAIL_REGEX,
  MIN_PASSWORD_LENGTH,
  USERNAME_REGEX,
} from "../../utils/authValidation";

// ajuste os caminhos conforme o seu projeto
import {
  createUser,
  validateEmail,
  validateUsername,
} from "../../service/user/UserService";
import type { UserRequest } from "../../types/user/UserRequest"

import logo from "../../assets/logo.png";
import "../../styles/login.css";
import "../../styles/register.css";

const DEBOUNCE_MS = 500;
const MAX_SUGGESTIONS = 5;

type FieldName =
  | "name"
  | "userName"
  | "email"
  | "password"
  | "confirmPassword";

type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Enter your name.";
  }

  if (!USERNAME_REGEX.test(values.userName)) {
    errors.userName = "3–20 characters: letters, numbers, _ or .";
  }

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email.";
  }

  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `At least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match.";
  }

  return errors;
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 409) {
      return "This email or username is already in use.";
    }

    const message = error.response?.data?.message;

    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "Couldn't create your account. Please try again.";
}

const emptyValues: FormValues = {
  name: "",
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emptyTouched: Record<FieldName, boolean> = {
  name: false,
  userName: false,
  email: false,
  password: false,
  confirmPassword: false,
};

function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [touched, setTouched] = useState(emptyTouched);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = useMutation({
    mutationFn: (request: UserRequest) => createUser(request),
    onSuccess: () => setIsSuccess(true),
  });

  const errors = useMemo(() => validate(values), [values]);

  /*
   * ============================
   * DISPONIBILIDADE EM TEMPO REAL
   * ============================
   *
   * A consulta só roda quando:
   *  1. o valor já passou na validação de formato
   *  2. o usuário parou de digitar por DEBOUNCE_MS
   */

  const trimmedEmail = values.email.trim();

  const debouncedUserName = useDebounce(values.userName, DEBOUNCE_MS);
  const debouncedEmail = useDebounce(trimmedEmail, DEBOUNCE_MS);

  const userNameFormatOk = USERNAME_REGEX.test(values.userName);
  const emailFormatOk = EMAIL_REGEX.test(trimmedEmail);

  const userNameQuery = useQuery({
    queryKey: ["validate-username", debouncedUserName],
    queryFn: () => validateUsername(debouncedUserName),
    enabled: USERNAME_REGEX.test(debouncedUserName),
    staleTime: 60 * 1000,
    retry: false,
  });

  const emailQuery = useQuery({
    queryKey: ["validate-email", debouncedEmail],
    queryFn: () => validateEmail(debouncedEmail),
    enabled: EMAIL_REGEX.test(debouncedEmail),
    staleTime: 60 * 1000,
    retry: false,
  });

  // "settled" = o valor digitado já é o mesmo que foi consultado
  const userNameSettled =
    userNameFormatOk && debouncedUserName === values.userName;

  const emailSettled = emailFormatOk && debouncedEmail === trimmedEmail;

  const isCheckingUserName =
    userNameFormatOk && (!userNameSettled || userNameQuery.isFetching);

  const isCheckingEmail =
    emailFormatOk && (!emailSettled || emailQuery.isFetching);

  const userNameResult =
    userNameSettled && !userNameQuery.isFetching ? userNameQuery.data : undefined;

  const emailResult =
    emailSettled && !emailQuery.isFetching ? emailQuery.data : undefined;

  const isUserNameTaken = userNameResult?.available === false;
  const isUserNameAvailable = userNameResult?.available === true;

  const isEmailTaken = emailResult?.available === false;
  const isEmailAvailable = emailResult?.available === true;

  const userNameSuggestions = (userNameResult?.suggestions ?? []).slice(
    0,
    MAX_SUGGESTIONS
  );

  // depois de criar a conta, vai pro login sozinho
  useEffect(() => {
    if (!isSuccess) return;

    const timer = window.setTimeout(() => navigate("/login"), 2500);

    return () => window.clearTimeout(timer);
  }, [isSuccess, navigate]);

  const handleChange =
    (field: FieldName) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // username não aceita espaços
      const value =
        field === "userName"
          ? event.target.value.replace(/\s/g, "")
          : event.target.value;

      setValues((current) => ({ ...current, [field]: value }));
    };

  const handleBlur = (field: FieldName) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setValues((current) => ({ ...current, userName: suggestion }));
    setTouched((current) => ({ ...current, userName: true }));
  };

  // erros de formato aparecem depois do blur;
  // "já em uso" aparece em tempo real, assim que a consulta responde
  const getError = (field: FieldName) =>
    touched[field] ? errors[field] : undefined;

  const isValid = (field: FieldName) =>
    touched[field] && !errors[field] && values[field].length > 0;

  const userNameError =
    getError("userName") ??
    (isUserNameTaken ? `@${values.userName} is already taken.` : undefined);

  const emailError =
    getError("email") ??
    (isEmailTaken ? "This email is already registered." : undefined);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({
      name: true,
      userName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (
      Object.keys(errors).length > 0 ||
      isUserNameTaken ||
      isEmailTaken ||
      registerMutation.isPending
    ) {
      return;
    }

    registerMutation.mutate({
      name: values.name.trim(),
      userName: values.userName.trim(),
      email: trimmedEmail,
      password: values.password,
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

  return (
    <div className="login-lay">
      <AuthShowcase />

      <section className="login-box-right">
        {/* só aparece no mobile, quando o painel roxo some */}
        <div className="brand brand-mobile">
          <img src={logo} alt="Artisphere logo" className="brand-logo" />
          <span className="brand-name">Artisphere</span>
        </div>

        {!isSuccess && (
          <div className="login-heading">
            <h1>Create account</h1>
            <p>Join Artisphere and start sharing your art</p>
          </div>
        )}

        {isSuccess ? (
          <div className="login-box register-box register-success">
            <svg className="success-check" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="success-circle" cx="26" cy="26" r="24" />
              <path className="success-tick" d="M14 27l8 8 16-18" />
            </svg>

            <h2>Account created!</h2>

            <p>
              Welcome to Artisphere, {values.name.trim().split(" ")[0]}.
              Taking you to the login...
            </p>

            <Button type="button" onClick={() => navigate("/login")}>
              Go to login
            </Button>
          </div>
        ) : (
          <div className="login-box register-box">
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <FormField
                index={0}
                id="name"
                label="Name"
                value={values.name}
                onChange={handleChange("name")}
                onBlur={handleBlur("name")}
                error={getError("name")}
                showValid={isValid("name")}
                autoComplete="name"
                placeholder="Your name"
              />

              <FormField
                index={1}
                id="userName"
                label="Username"
                value={values.userName}
                onChange={handleChange("userName")}
                onBlur={handleBlur("userName")}
                error={userNameError}
                showValid={isUserNameAvailable}
                checking={isCheckingUserName}
                successMessage={
                  isUserNameAvailable ? "Username available" : undefined
                }
                autoComplete="username"
                placeholder="your_username"
              >
                {isUserNameTaken && userNameSuggestions.length > 0 && (
                  <div className="suggestions">
                    <span className="suggestions-label">Try:</span>

                    {userNameSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="suggestion-chip"
                        style={{ "--i": index } as React.CSSProperties}
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        @{suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </FormField>

              <FormField
                index={2}
                id="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                error={emailError}
                showValid={isEmailAvailable}
                checking={isCheckingEmail}
                autoComplete="email"
                placeholder="you@email.com"
              >
                {isEmailTaken && (
                  <button
                    type="button"
                    className="field-link"
                    onClick={() => navigate("/login")}
                  >
                    Already have an account? Log in
                  </button>
                )}
              </FormField>

              <FormField
                index={3}
                id="password"
                label="Password"
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
                index={4}
                id="confirmPassword"
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                error={getError("confirmPassword")}
                showValid={isValid("confirmPassword")}
                autoComplete="new-password"
                placeholder="••••••••"
              />

              {registerMutation.isError && (
                <p className="login-error" role="alert">
                  {getErrorMessage(registerMutation.error)}
                </p>
              )}

              <div className="btn-login-box">
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending
                    ? "Creating account..."
                    : "Create account"}
                </Button>
              </div>
            </form>

            <div className="line"></div>

            <div className="sign-box">
              <span>Already have an account?</span>
              <button
                type="button"
                className="link-btn strong"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Register;