export interface ICreateInvitation {
  email: string;
  role: number;
}

export interface IInvitation {
  id: number;
  email: string;
  role: number;
  roleName: string;
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
  status: number;
  invitedByUserName?: string;
  firstName?: string;
  lastName?: string;
}

export interface ICompleteInvitation {
  token: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  street: string;
  nid: string;
  paymentNumber: string;
  dateOfHiring: Date;
  password: string;
  profilePicture?: string;
  jobTitle?: string;
  bio?: string;
}