export interface Service {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
}

export interface TaskItem {

}

export interface CreateServiceRequest {
    title: string;
    description: string;
}

export interface CreateTaskItemRequest {
}
