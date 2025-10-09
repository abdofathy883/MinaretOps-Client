export interface ICreateJD {
    roleId: string;
    jobResponsibilities: ICreateJR[];
}

export interface ICreateJR {
    text: string;
}

export interface IJR{
    id: number;
    jobDescriptionId: number;
    text: string;
}

export interface IJD{
    id: number;
    roleId: string;
    role: string;
    jobResponsibilities: IJR[];
}
