export interface LoginRequest {
  login: string;
  password: string;
}

export interface UserInfo {
  id: number;
  fullName: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
