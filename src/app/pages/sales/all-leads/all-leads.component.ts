import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeadService } from '../../../services/sales/lead.service';
import {
  ContactStatus,
  CurrentLeadStatus,
  InterestLevel,
  IPaginatedLeadResult,
  ISalesLead,
} from '../../../model/sales/i-sales-lead';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import { LeadsOpsService } from '../../../services/sales/sales-ops/leads-ops.service';
import { LeadImportResult } from '../../../model/sales/i-lead-import-result';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './all-leads.component.html',
  styleUrl: './all-leads.component.css',
})
export class AllLeadsComponent implements OnInit {
  leads: ISalesLead[] = [];
  searchResults: ISalesLead[] = [];
  employees: User[] = [];
  isImporting: boolean = false;
  isExporting: boolean = false;
  isLoadingTemplates: boolean = false;
  isLoadingLeads: boolean = false;
  isSearching: boolean = false;
  searchQuery: string = '';

  currentPage: number = 1;
  pageSize: number = 30;
  totalRecords: number = 0;
  totalPages: number = 0;

  importResult: LeadImportResult | null = null;
  importError: string | null = null;

  contactStatuses = Object.values(ContactStatus).filter(
    (value) => typeof value === 'number',
  );
  interestLevels = Object.values(InterestLevel).filter(
    (value) => typeof value === 'number',
  );
  leadStatuses = Object.values(CurrentLeadStatus).filter(
    (value) => typeof value === 'number',
  );

  ContactStatus = ContactStatus;
  InterestLevel = InterestLevel;
  CurrentLeadStatus = CurrentLeadStatus;
  constructor(
    private leadService: LeadService,
    private leadOpsService: LeadsOpsService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadLeads();
    this.loadEmployees();
  }

  loadLeads() {
    this.isLoadingLeads = true;
    this.leadService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.leads = result.records;
        this.totalRecords = result.totalRecords;
        this.totalPages = result.totalPages;
        this.currentPage = result.pageNumber;
        this.isLoadingLeads = false;
      },
      error: (err) => {
        this.isLoadingLeads = false;
        console.error('Failed to load leads', err);
      },
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadLeads();
  }

  loadEmployees() {
    this.authService
      .getAll()
      .subscribe((response) => (this.employees = response));
  }

  updateField(lead: ISalesLead, field: string, value: any) {
    this.leadService.updateField(lead.id, field, value).subscribe({
      next: (updatedLead) => {
        Object.assign(lead, updatedLead);
      },
      error: (err) => {
        console.error('Update failed', err);
      },
    });
  }

  getEnumLabel(enumObj: any, value: any): string {
    return enumObj[value];
  }

  openLeadDetails(leadId: number) {
    this.router.navigate(['/leads/details', leadId]);
  }

  onImport(event: any) {
    this.isImporting = true;
    this.importResult = null;
    this.importError = null;
    const file = event.target.files[0];
    if (file) {
      this.leadOpsService.importLeads(file).subscribe({
        next: (result) => {
          this.isImporting = false;
          this.importResult = result;
          this.loadLeads();
        },
        error: (err) => {
          this.isImporting = false;
          this.importError =
            err.error?.message || err.error || 'Import failed unexpectedly.';
          console.error('Import failed', err);
        },
      });
    }
    event.target.value = '';
  }

  dismissImportResult() {
    this.importResult = null;
    this.importError = null;
  }

  onExport() {
    this.isExporting = true;
    this.leadOpsService
      .exportLeads()
      .pipe(finalize(() => (this.isExporting = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Leads-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Export failed', err);
        },
      });
  }

  onDownloadTemplate() {
    this.isLoadingTemplates = true;
    this.leadOpsService
      .downloadTemplate()
      .pipe(finalize(() => (this.isLoadingTemplates = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Leads Template.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Template download failed', err);
        },
      });
  }

  onSearchInput() {
    if (this.searchQuery.trim().length >= 0) {
      this.performSearch();
    } else if (this.searchQuery.trim().length === 0) {
      this.clearSearch();
    }
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.clearSearch();
      return;
    }

    this.isSearching = true;
    this.leadService.search(this.searchQuery.trim()).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.leads = response;
        this.isSearching = false;
      },
      error: (error) => {
        this.isSearching = false;
      },
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearching = false;
    this.currentPage = 1;
    this.loadLeads();
  }
}
