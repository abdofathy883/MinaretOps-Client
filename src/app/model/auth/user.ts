export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  city: string;
  street: string;
  paymentNumber: string;
  nid: string;
  dateOfHiring: Date;
  jobTitle: string;
  bio: string;
  profilePicture: string;
  message: string;
  isAuthenticated: boolean;
  isDeleted: boolean;
  roles: string[];
  token: string;
  refreshToken: string;
  refreshTokenExpiration: Date;
  concurrencyStamp: string;
}

export interface UpdateUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  jobTitle: string;
  bio: string;
  profilePicture: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  street?: string;
  paymentNumber?: string;
}

export interface ChangePassword {
  id: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface LoginUser {
  phoneNumber: string;
  password: string;
}

export interface RegisterUser {
  firstName: string;
  lastName: string;
  jobTitle: string;
  bio: string;
  profilePicture: string;
  email: string;
  phoneNumber: string;
  role: number;
  password: string;
  city: string;
  street: string;
  paymentNumber: string;
  nid: string;
  dateOfHiring: Date;
}

export interface TokenPayload {
    exp: number;
  sub: string;
  role: string;
  [key: string]: any;
}