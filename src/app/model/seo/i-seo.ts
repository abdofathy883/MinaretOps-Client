export interface ISeo {
    id: number;
    route: string;
    language: string;
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    robots?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface ICreateSeo{
    route: string;
    language: string;
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: File;
    canonicalUrl?: string;
    robots?: string;
}
