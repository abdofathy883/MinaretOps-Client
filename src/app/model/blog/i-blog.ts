export enum ContentLanguage {
    Arabic = 0,
    Engilsh = 1
}

export interface IBlog {
    id: number;
    title: string;
    content: string;
    featuredImage: string;
    imageAltText?: string;
    categoryId: number;
    categoryName: string;
    author: string;
    isFeatured: boolean;
    createdAt: Date;
    contentLanguageId: number;
    language: ContentLanguage;
}

export interface IBlogCategory {
    id: number;
    title: string;
    contentLanguageId: number;
    language: ContentLanguage;
}

export interface ICreateBlog {
    title: string;
    content: string;
    featuredImage: File;
    imageAltText?: string;
    categoryId: number;
    author: string;
    isFeatured: boolean;
    contentLanguageId?: number;
    language: ContentLanguage;
}

export interface ICreateBlogCategory {
    title: string;
    contentLanguageId?: number;
    language: ContentLanguage;
}
