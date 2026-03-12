import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { ILeadEmployeeReport } from '../../model/reporting/i-lead-employee-report';

@Injectable({
  providedIn: 'root'
})
export class LeadReportingService {
  private endpoint = 'leadreport';
  constructor(private api: ApiService) { }

  getLeadEmployeeReport(currentUserId: string, fromDate?: Date, toDate?: Date): Observable<ILeadEmployeeReport[]> {
    let url = `${this.endpoint}/get-lead-employee-report?currentUserId=${currentUserId}`;
    
    if (fromDate) {
      url += `&fromDate=${this.formatDate(fromDate)}`;
    }
    if (toDate) {
      url += `&toDate=${this.formatDate(toDate)}`;
    }
    
    return this.api.get<ILeadEmployeeReport[]>(url);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
