import { isAxiosError } from "axios";

export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;

/* 0 = vazio, 1 = fraca ... 4 = forte */
export function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0;
  if (password.length < MIN_PASSWORD_LENGTH) return 1;

  let score = 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

export const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

/* Lê o campo "message" do corpo de erro da API, se existir */
export function getApiErrorMessage(error: unknown): string | undefined {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message) {
      return message;
    }
  }

  return undefined;
}