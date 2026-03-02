import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeadService } from '../../../services/sales/lead.service';
import {
  ContactStatus,
  CurrentLeadStatus,
  InterestLevel,
  ISalesLead,
} from '../../../model/sales/i-sales-lead';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import { LeadsOpsService } from '../../../services/sales/sales-ops/leads-ops.service';
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

  // Enum Helpers
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
    this.leadService.getAll().subscribe({
      next: (data) => {
        this.leads = data;
        this.isLoadingLeads = false;
      },
      error: (err) => {
        this.isLoadingLeads = false;
        console.error('Failed to load leads', err);
      },
    });
  }

  loadEmployees() {
    this.authService
      .getAll()
      .subscribe((response) => (this.employees = response));
  }

  updateField(lead: ISalesLead, field: string, value: any) {
    // Optimistic Update? Or wait?
    // The model is already updated via ngModel.
    // Ensure value is correct type (e.g. number for Enum)

    // For Enums in select, Angular usually binds string if using value="0".
    // Need to ensure type casting if backend expects strict int.
    // The <option [ngValue]="s"> handles types better than value="{{s}}".

    this.leadService.updateField(lead.id, field, value).subscribe({
      next: (updatedLead) => {
        // Optional: Replace object with server response to sync details like UpdatedAt
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
    const file = event.target.files[0];
    if (file) {
      this.leadOpsService.importLeads(file).subscribe({
        next: () => {
          this.isImporting = false;
          this.loadLeads();
          alert('Leads imported successfully');
        },
        error: (err) => {
          this.isImporting = false;
          console.error('Import failed', err);
          alert('Import failed');
        },
      });
    }
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
          // a.download = 'Leads.xlsx';
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
    const link = document.createElement('a');
    link.href = 'assets/Leads Template.xlsx';
    link.download = 'Leads Template.xlsx';
    link.target = '_blank';
    link.click();
    link.remove();
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

    // Reset to first day of current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // this.filterForm.patchValue({
    //   clientId: null,
    //   employeeId: null,
    //   priority: null,
    //   fromDate: firstDayStr,
    //   toDate: todayStr,
    //   status: null,
    //   onDeadline: null,
    //   team: null,
    // });

    // this.currentPage = 1;
    this.loadLeads();
  }
}
