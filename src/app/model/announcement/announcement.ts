export interface Announcement {
    id: number;
    title: string;
    message: string;
    createdAt: Date;
    isRead: boolean;
}

export interface CreateAnnouncement {
    title: string;
    message: string;
}
