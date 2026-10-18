
import api from "../../api/api";
import type { ForgotPasswordRequest, ResetPasswordRequest } from "../../types/passsword-reset/passwordResetType";


export async function forgotPassword(
  request: ForgotPasswordRequest
): Promise<void> {
  await api.post("/reset/forgot-password", request);
}

export async function resendResetToken(
  request: ForgotPasswordRequest
): Promise<void> {
  await api.post("/reset/resend-token", request);
}

export async function resetPassword(
  request: ResetPasswordRequest
): Promise<void> {
  await api.post("/reset/reset-password", request);
}
