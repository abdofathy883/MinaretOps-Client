import { ClientServiceDTO } from "../client/client";

export interface Service {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    isDeleted: boolean;
    clientServices: ClientServiceDTO[];
}

export interface CreateServiceRequest {
    title: string;
    description: string;
}

export interface UpdateServiceRequest {
    id: number;
    title: string;
    description: string;
}
