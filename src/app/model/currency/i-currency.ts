export interface ICurrency {
    id: number;
    code: string;
    name: string;
    decimalPlaces: number;
}

export interface ICreateCurrency {
    code: string;
    name: string;
    decimalPlaces: number;
}
