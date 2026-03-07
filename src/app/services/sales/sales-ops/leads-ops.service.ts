import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api-service/api.service';
import { ICreateLeadNote, ILeadNote } from '../../../model/sales/i-sales-lead';
import { LeadImportResult } from '../../../model/sales/i-lead-import-result';

@Injectable({
  providedIn: 'root',
})
export class LeadsOpsService {
  private endpoint: string = 'leadops';

  constructor(private api: ApiService) {}

  importLeads(file: File): Observable<LeadImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<LeadImportResult>(
      `${this.endpoint}/import`,
      formData,
    );
  }

  downloadTemplate(): Observable<Blob> {
    return this.api.getBlob(`${this.endpoint}/template`);
  }

  exportLeads(): Observable<Blob> {
    return this.api.getBlob(`${this.endpoint}/export`);
  }

  getNotes(leadId: number): Observable<ILeadNote[]> {
    return this.api.get<ILeadNote[]>(`${this.endpoint}/notes/${leadId}`);
  }

  createNote(dto: ICreateLeadNote): Observable<ILeadNote> {
    return this.api.post<ILeadNote>(`${this.endpoint}/create-note`, dto);
  }
}
