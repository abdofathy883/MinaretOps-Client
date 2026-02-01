import { Component, OnInit } from '@angular/core';
import { ISalesLead, IUpdateLead } from '../../../model/sales/i-sales-lead';
import { LeadService } from '../../../services/sales/lead.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicesService } from '../../../services/services/services.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-single-lead',
  imports: [ReactiveFormsModule],
  templateUrl: './single-lead.component.html',
  styleUrl: './single-lead.component.css',
})
export class SingleLeadComponent implements OnInit {
  lead: ISalesLead | null = null;
  services: Service[] = [];
  employees: User[] = [];
  leadForm!: FormGroup;
  isLoading: boolean = false;
  isDeleteing: boolean = false;

  constructor(
    private leadService: LeadService,
    private serviceService: ServicesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initialzeForm();
    this.loadServices();
    this.loadEmployees();
    this.loadLead();
  }

  initialzeForm() {
    this.leadForm = this.fb.group({
      businessName: ['', Validators.required],
      whatsAppNumber: ['', Validators.required],
      contactStatus: [, Validators.required],
      leadSource: [],
      decisionMakerReached: [false],
      interested: [false, Validators.required],
      interestLevel: ['', Validators.required],
      servicesInterestedIn: [[]],
      meetingAttend: [''],
      meetingAgreed: [false],
      meetingDate: [],
      quotationSent: [false],
      currentStatus: [],
      followUpTime: [],
      followUpReason: [],
      assignedTo: [],
      notes: [''],
      salesRepId: [],
      contactAttempts: []
    });
  }

  populateForm() {
    if (!this.lead) return;
    this.leadForm.patchValue({
      businessName: this.lead.businessName,
      whatsAppNumber: this.lead.whatsAppNumber,
      contactStatus: this.lead.contactStatus,
      leadSource: this.lead.leadSource,
      decisionMakerReached: this.lead.decisionMakerReached,
      interested: this.lead.interested,
      interestLevel: this.lead.interestLevel,
      servicesInterestedIn: this.lead.servicesInterestedIn.map(s => s.serviceId),
      meetingAttend: this.lead.meetingAttend,
      meetingAgreed: this.lead.meetingAgreed,
      meetingDate: this.lead.meetingDate,
      quotationSent: this.lead.quotationSent,
      followUpTime: this.lead.followUpTime,
      followUpReason: this.lead.followUpReason,
      notes: this.lead.notes,
      salesRepId: this.lead.salesRepId,
      contactAttempts: this.lead.contactAttempts
    });
  }

  loadLead() {
    const leadId = Number(this.route.snapshot.paramMap.get('id'));
    this.leadService.getById(leadId).subscribe({
      next: (response) => {
        this.lead = response;
        console.log(this.lead);
        this.populateForm();
      },
    });
  }

  loadServices() {
    this.serviceService.getAll().subscribe((response) => this.services = response);
  }

  loadEmployees() {
    this.authService.getAll().subscribe((response) => this.employees = response);
  }

  onSubmit() {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formValue = this.leadForm.value;
    const payload: IUpdateLead = {
      ...formValue,
      id: this.lead?.id!,
      servicesInterestedIn: formValue.servicesInterestedIn || []
    };

    this.leadService.update(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Optionally update local lead data
        this.lead = response;
        // Show success message (simple alert for now as no toast service visible)
        alert('Lead updated successfully');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Update failed', error);
        alert('Update failed: ' + (error.error?.message || error.message));
      }
    });
  }

  deleteLead() {
    if (!this.lead) return;
    this.isDeleteing = true;
    this.leadService.delete(this.lead.id).subscribe({
      next: () => {
        this.isDeleteing = false;
        this.router.navigate(['/sales/leads']);
        // Handle successful deletion, e.g., navigate away or show a message
      },
      error: (error) => {
        this.isDeleteing = false;
        // Handle error, e.g., show an error message
      }
    });
  }
}
