export interface ILoginLog {
  id: number;
  userId: string;
  userName: string;
  timestamp: Date;
  ipAddress: string;
  isSuccess: boolean;
  failureReason: string;
  userAgent: string;
}
