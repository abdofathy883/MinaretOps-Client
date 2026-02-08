import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICreateLead, MeetingAttend } from '../../../model/sales/i-sales-lead';
import { LeadService } from '../../../services/sales/lead.service';
import { ServicesService } from '../../../services/services/services.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { hasError } from '../../../services/helper-services/utils';

@Component({
  selector: 'app-add-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-lead.component.html',
  styleUrl: './add-lead.component.css',
})
export class AddLeadComponent implements OnInit {
  leadForm!: FormGroup;
  availableServices: Service[] = [];
  employees: User[] = [];
  currentUserId: string = '';
  @Output() created = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  isLoading = false;

    alertMessage = '';
  alertType = 'info';

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private servicesService: ServicesService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadEmployees();
    this.loadServices();
    this.currentUserId = this.authService.getCurrentUserId();
  }
  initializeForm() {
    this.leadForm = this.fb.group({
      businessName: ['', Validators.required],
      whatsAppNumber: ['', Validators.required],
      contactStatus: [null, Validators.required],
      leadSource: [],
      decisionMakerReached: [false],
      interested: [null, Validators.required],
      interestLevel: [null, Validators.required],
      servicesInterestedIn: [[]],
      meetingAttend: [''],
      meetingAgreed: [false],
      meetingDate: [],
      quotationSent: [false],
      currentStatus: [null],
      followUpTime: [],
      followUpReason: [],
      assignedTo: [],
      notes: [''],
      createdById: [''],
    });
  }

  get isMeetingAgreed(): boolean {
    return this.leadForm.get('meetingAgreed')?.value === true;
  }

  get isFollowUpLater(): boolean {
    return this.leadForm.get('currentStatus')?.value === 5; // 5 is FollowUpLater
  }

  loadEmployees() {
    this.authService
      .getAll()
      .subscribe((response) => (this.employees = response));
  }

  loadServices() {
    this.servicesService
      .getAll()
      .subscribe((response) => (this.availableServices = response));
  }

  onSubmit() {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.leadForm.value;

    const servicesDTO = (formValue.servicesInterestedIn || []).map(
      (id: number) => ({
        serviceId: id,
        leadId: 0, // Backend ignores or handles this
      }),
    );

    const newLead: ICreateLead = {
      businessName: formValue.businessName,
      whatsAppNumber: formValue.whatsAppNumber,
      contactAttempts: 0, // Default to 0
      contactStatus: formValue.contactStatus,
      meetingAgreed: formValue.meetingAgreed,
      meetingDate: formValue.meetingDate,
      servicesInterestedIn: servicesDTO,
      salesRepId: formValue.assignedTo,
      meetingAttend: MeetingAttend.Pending,
      interestLevel: formValue.interestLevel,
      leadSource: Number(formValue.leadSource),
      decisionMakerReached: formValue.decisionMakerReached,
      interested: formValue.interested,
      createdById: this.currentUserId,
      quotationSent: false,
      followUpReason: formValue.followUpReason,
    };

    console.log('Submitting new lead:', newLead);
    // Remove UI-only fields if necessary, but spreading handles most.
    // Explicitly mapping overrides spreads.

    this.leadService.create(newLead).subscribe({
      next: () => {
        this.isLoading = false;
        this.created.emit();
        this.leadForm.reset();
        this.leadForm.patchValue({ servicesInterestedIn: [] });
        this.showAlert('تم إضافة العميل بنجاح!', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.showAlert('حدث خطأ أثناء إضافة العميل', 'error');
      },
    });
  }

  // Keeping helper for validation
  hasError(controlName: string) {
    return hasError(this.leadForm, controlName);
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert() {
    this.alertMessage = '';
  }
}
