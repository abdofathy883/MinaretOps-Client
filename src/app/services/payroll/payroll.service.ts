import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { ICreateSalaryPayment, ICreateSalaryPeriod, ISalaryPayment, ISalaryPeriod } from '../../model/salary/i-salary-payment';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private endpoint = 'payroll';
  constructor(private api: ApiService) { }

  createSalaryPeriod(data: ICreateSalaryPeriod): Observable<ISalaryPeriod> {
    return this.api.post<ISalaryPeriod>(`${this.endpoint}/salary-period`, data);
  }

  recordSalaryPayment(data: ICreateSalaryPayment): Observable<ISalaryPayment> {
    return this.api.post<ISalaryPayment>(`${this.endpoint}/salary-payment`, data);
  }

  getSalaryPeriodsByEmployee(employeeId: string): Observable<ISalaryPeriod[]> {
    return this.api.get<ISalaryPeriod[]>(`${this.endpoint}/salary-periods/employee/${employeeId}`);
  }

  getAllSalaryPeriods(): Observable<ISalaryPeriod[]> {
    return this.api.get<ISalaryPeriod[]>(`${this.endpoint}/salary-periods`);
  }

  getSalaryPeriodById(periodId: number): Observable<ISalaryPeriod> {
    return this.api.get<ISalaryPeriod>(`${this.endpoint}/salary-period/${periodId}`);
  }

  getSalaryPeriod(employeeId: string, month: number, year: number): Observable<ISalaryPeriod> {
    return this.api.get<ISalaryPeriod>(`${this.endpoint}/salary-period/employee/${employeeId}/month/${month}/year/${year}`);
  }

  getSalaryPaymentsByEmployee(employeeId: string): Observable<ISalaryPayment[]> {
    return this.api.get<ISalaryPayment[]>(`${this.endpoint}/salary-payments/employee/${employeeId}`);
  }
}
