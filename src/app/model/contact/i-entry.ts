export interface IEntry {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    message: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    isSpam: boolean;
}
