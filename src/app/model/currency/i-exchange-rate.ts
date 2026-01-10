export interface IExchangeRate {
    id: number;
    fromCurrencyId: number;
    toCurrencyId: number;
    rate: number;
    effectiveFrom: Date | string;
    effectiveTo?: Date | string | null;
    isActive: boolean;
}

export interface ICreateExchangeRate {
    fromCurrencyId: number;
    toCurrencyId: number;
    rate: number;
    effectiveFrom: Date | string;
    effectiveTo?: Date | string | null;
    isActive: boolean;
}

