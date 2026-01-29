import { Component, OnInit } from '@angular/core';
import { ISalesLead } from '../../../model/sales/i-sales-lead';
import { LeadService } from '../../../services/sales/lead.service';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private leadService: LeadService,
    private serviceService: ServicesService,
    private authService: AuthService,
    private route: ActivatedRoute,
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
      decisionMakerReached: [],
      interested: ['', Validators.required],
      interestLevel: ['', Validators.required],
      servicesInterestedIn: [[]],
      meetingAttend: [''],
      meetingAgreed: [''],
      meetingDate: [],
      quotationSent: [''],
      currentStatus: [],
      followUpTime: [],
      followUpReason: [],
      assignedTo: [],
      notes: [''],
      createdById: [''],
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
      servicesInterestedIn: this.lead.servicesInterestedIn,
      meetingAttend: this.lead.meetingAttend,
      meetingAgreed: this.lead.meetingAgreed,
      meetingDate: this.lead.meetingDate,
      quotationSent: this.lead.quotationSent,
      followUpTime: this.lead.followUpTime,
      followUpReason: this.lead.followUpReason,
      notes: this.lead.notes,
      salesRepId: this.lead.salesRepId,
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
  }
}
