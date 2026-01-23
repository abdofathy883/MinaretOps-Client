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
  message: string;
  isAuthenticated: boolean;
  isDeleted: boolean;
  roles: string[];
  token: string;
  refreshToken: string;
  refreshTokenExpiration: Date;
  concurrencyStamp: string;
  baseSalary: number;
  employeeType: EmployeeType;
}

export enum UserRoles {
  Admin = 1,
  AccountManager = 2,
  GraphicDesigner = 3,
  GraphicDesignerTeamLeader = 4,
  ContentCreator = 5,
  ContentCreatorTeamLeader = 6,
  AdsSpecialest = 7,
  SEOSpecialest = 8,
  WebDeveloper = 9,
  VideoEditor = 10,
  Finance = 11
}

export interface UpdateUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  street?: string;
  paymentNumber?: string;
  role: number;
  baseSalary: number;
  employeeType?: EmployeeType;
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
  email: string;
  phoneNumber: string;
  role: number;
  password: string;
  city: string;
  street: string;
  paymentNumber: string;
  nid: string;
  dateOfHiring: Date;
  baseSalary: number;
  employeeType: EmployeeType;
}

export interface IResetPassword {
  userId: string;
  token: string;
  newPassword: string;
}

export interface TokenPayload {
  exp: number;
  sub: string;
  role: string;
  [key: string]: any;
}

export enum EmployeeType {
  FullTime = 0,
  PartTime = 1,
  Freelance = 2,
}
