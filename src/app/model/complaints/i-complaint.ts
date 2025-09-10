export interface IComplaint {
    id: number;
    subject: string;
    content: string;
    employeeId: string;
    employeeName: string;
    createdAt: Date;
}

export interface ICreateComplaint{
    subject: string;
    content: string;
    employeeId: string;
}
