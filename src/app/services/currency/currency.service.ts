import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { ICreateCurrency, ICurrency } from '../../model/currency/i-currency';
import { IExchangeRate, ICreateExchangeRate } from '../../model/currency/i-exchange-rate';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private endpoint: string = 'currency';
  constructor(private api: ApiService) {}

  getAll(): Observable<ICurrency[]> {
    return this.api.get<ICurrency[]>(this.endpoint);
  }

  getById(id: number): Observable<ICurrency> {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  create(currency: ICreateCurrency): Observable<ICurrency> {
    return this.api.post<ICurrency>(this.endpoint, currency);
  }

  update(id: number, currency: ICreateCurrency): Observable<ICurrency> {
    return this.api.put<ICurrency>(`${this.endpoint}/${id}`, currency);
  }

  getExchangeRatesByCurrencyId(currencyId: number): Observable<IExchangeRate[]> {
    return this.api.get<IExchangeRate[]>(`${this.endpoint}/${currencyId}/exchange-rates`);
  }

  createExchangeRate(exchangeRate: ICreateExchangeRate): Observable<IExchangeRate> {
    return this.api.post<IExchangeRate>(`${this.endpoint}/exchange-rate`, exchangeRate);
  }
}
