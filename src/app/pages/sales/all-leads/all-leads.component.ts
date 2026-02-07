import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../../services/sales/lead.service';
import {
  ContactStatus,
  FollowUpReason,
  InterestLevel,
  ISalesLead,
  LeadSource,
  MeetingAttend,
} from '../../../model/sales/i-sales-lead';
import { AddLeadComponent } from '../add-lead/add-lead.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, AddLeadComponent],
  templateUrl: './all-leads.component.html',
  styleUrl: './all-leads.component.css',
})
export class AllLeadsComponent implements OnInit {
  leads: ISalesLead[] = [];
  showCreateModal = false;
  isImporting: boolean = false;
  isExporting: boolean = false;
  isLoadingTemplates: boolean = false;
  isLoadingLeads: boolean = false;

  // Enum Helpers
  contactStatuses = Object.values(ContactStatus).filter(
    (value) => typeof value === 'number',
  );
  interestLevels = Object.values(InterestLevel).filter(
    (value) => typeof value === 'number',
  );
  meetingAttends = Object.values(MeetingAttend).filter(
    (value) => typeof value === 'number',
  );

  ContactStatus = ContactStatus;
  InterestLevel = InterestLevel;
  MeetingAttend = MeetingAttend;

  constructor(
    private leadService: LeadService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.isLoadingLeads = true;
    this.leadService.getAll().subscribe({
      next: (data) => {
        ((this.leads = data), (this.isLoadingLeads = false));
      },
      error: (err) => {
        this.isLoadingLeads = false;
        console.error('Failed to load leads', err);
      },
    });
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
        // Toast or subtle indicator?
        // const Toast = Swal.mixin({
        //   toast: true,
        //   position: 'top-end',
        //   showConfirmButton: false,
        //   timer: 1500,
        //   timerProgressBar: true,
        //   didOpen: (toast) => {
        //      toast.addEventListener('mouseenter', Swal.stopTimer)
        //      toast.addEventListener('mouseleave', Swal.resumeTimer)
        //   }
        // })

        // Toast.fire({
        //   icon: 'success',
        //   title: 'Updated'
        // })
      },
      error: (err) => {
        console.error('Update failed', err);
        // Swal.fire('Error', 'Update failed', 'error');
        // Revert? (Complex without state management)
      },
    });
  }

  onLeadCreated() {
    this.showCreateModal = false;
    this.loadLeads();
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
      this.leadService.importLeads(file).subscribe({
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
    this.leadService.exportLeads().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Leads.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: (err) => {
        this.isExporting = false;
        console.error('Export failed', err);
      },
    });
  }

  onDownloadTemplate() {
    this.leadService.getTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LeadsTemplate.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download template failed', err),
    });
  }
}
