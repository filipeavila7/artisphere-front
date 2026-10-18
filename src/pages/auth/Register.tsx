import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";

import Button from "../../components/button/Button";
import AuthShowcase from "../../components/auth/AuthShowcase";

// ajuste os caminhos conforme o seu projeto
import { createUser } from "../../service/user/UserService";

import logo from "../../assets/logo.png";
import "../../styles/login.css";
import "../../styles/register.css";
import type { UserRequest } from "../../types/user/UserRequest";

const MIN_PASSWORD_LENGTH = 8;

type FieldName =
  | "name"
  | "userName"
  | "email"
  | "password"
  | "confirmPassword";

type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;

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

/* 0 = vazio, 1 = fraca ... 4 = forte */
function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0;
  if (password.length < MIN_PASSWORD_LENGTH) return 1;

  let score = 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

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

/* ================= CAMPO REUTILIZÁVEL ================= */

type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error?: string;
  showValid?: boolean;
  autoComplete?: string;
  placeholder?: string;
  index: number;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
};

function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  showValid,
  autoComplete,
  placeholder,
  index,
  trailing,
  children,
}: FormFieldProps) {
  const state = error ? " invalid" : showValid ? " valid" : "";

  return (
    <div
      className={`field${state}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <label htmlFor={id}>{label}</label>

      <div className="input-wrapper">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
        />

        {trailing ?? (showValid && <FaCheck className="valid-icon" />)}
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {children}
    </div>
  );
}

/* ================= PÁGINA ================= */

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
  const strength = getPasswordStrength(values.password);

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

  const getError = (field: FieldName) =>
    touched[field] ? errors[field] : undefined;

  const isValid = (field: FieldName) =>
    touched[field] && !errors[field] && values[field].length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({
      name: true,
      userName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(errors).length > 0 || registerMutation.isPending) {
      return;
    }

    registerMutation.mutate({
      name: values.name.trim(),
      userName: values.userName.trim(),
      email: values.email.trim(),
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
                error={getError("userName")}
                showValid={isValid("userName")}
                autoComplete="username"
                placeholder="your_username"
              />

              <FormField
                index={2}
                id="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                error={getError("email")}
                showValid={isValid("email")}
                autoComplete="email"
                placeholder="you@email.com"
              />

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
                {values.password && (
                  <div className={`strength level-${strength}`}>
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className={`strength-bar${level <= strength ? " on" : ""}`}
                        />
                      ))}
                    </div>

                    <span className="strength-label">
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
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