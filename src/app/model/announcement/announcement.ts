export interface Announcement {
    id: number;
    title: string;
    message: string;
    announcementLinks: IAnnouncementLink[];
    createdAt: Date;
}

export interface CreateAnnouncement {
    title: string;
    message: string;
    announcementLinks: ICreateAnnouncementLink[];
}

export interface ICreateAnnouncementLink {
    link: string;
}

export interface IAnnouncementLink {
    id: number;
    link: string;
}
