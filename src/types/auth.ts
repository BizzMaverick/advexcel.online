export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
}

export interface SignupData {
  identifier: string; // email or phone
  password: string;
  confirmPassword: string;
}

export interface OTPVerification {
  identifier: string;
  otp: string;
}

export interface ResetPasswordData {
  identifier: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
}