import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ILeadNote, ISalesLead, IUpdateLead, LeadSource } from '../../../model/sales/i-sales-lead';
import { LeadService } from '../../../services/sales/lead.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../../services/services/services.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';
import { hasError } from '../../../services/helper-services/utils';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, Toolbar } from 'ngx-editor';
import { LeadsOpsService } from '../../../services/sales/sales-ops/leads-ops.service';

@Component({
  selector: 'app-single-lead',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ShimmerComponent,
    NgxEditorComponent,
    NgxEditorMenuComponent
  ],
  templateUrl: './single-lead.component.html',
  styleUrl: './single-lead.component.css',
})
export class SingleLeadComponent implements OnInit, OnDestroy {
  lead: ISalesLead | null = null;
  notes: ILeadNote[] = [];
  services: Service[] = [];
  employees: User[] = [];
  leadForm!: FormGroup;
  isLoading = false;
  isLoadingLead = false;
  isDeleting = false;
  isLoadingNotes = false;

  /** One Editor per note */
  noteEditors: Editor[] = [];
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear', 'indent', 'outdent'],
    ['superscript', 'subscript'],
    ['undo', 'redo'],
  ];

  constructor(
    private leadService: LeadService,
    private leadOpsService: LeadsOpsService,
    private serviceService: ServicesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadServices();
    this.loadEmployees();
    this.loadLead();
  }

  ngOnDestroy(): void {
    this.noteEditors.forEach((e) => e.destroy());
    this.noteEditors = [];
  }

  initializeForm(): void {
    this.leadForm = this.fb.group({
      businessName: ['', Validators.required],
      whatsAppNumber: ['', Validators.required],
      country: [''],
      occupation: [''],
      contactStatus: [null, Validators.required],
      currentLeadStatus: [null, Validators.required],
      leadSource: [null, Validators.required],
      interestLevel: [null, Validators.required],
      freelancePlatform: [null],
      responsibility: [0],
      budget: [0],
      timeline: [0],
      needsExpectation: [0],
      servicesInterestedIn: [[]],
      meetingDate: [null],
      followUpTime: [null],
      quotationSent: [false],
      assignedTo: [null],
      notes: this.fb.array([this.fb.control('')]),
    });
    this.noteEditors = [new Editor()];
  }

  get notesFormArray(): FormArray {
    return this.leadForm.get('notes') as FormArray;
  }

  addNote(): void {
    this.notesFormArray.push(this.fb.control(''));
    this.noteEditors.push(new Editor());
  }

  removeNote(index: number): void {
    if (this.notesFormArray.length > 1) {
      this.noteEditors[index].destroy();
      this.noteEditors.splice(index, 1);
      this.notesFormArray.removeAt(index);
    }
  }

  getNoteEditor(index: number): Editor {
    return this.noteEditors[index];
  }

  get isFreelancePlatforms(): boolean {
    return Number(this.leadForm.get('leadSource')?.value) === LeadSource.FreelancingPlatforms;
  }

  hasError(controlName: string): boolean {
    return hasError(this.leadForm, controlName);
  }

  populateForm(): void {
    if (!this.lead) return;

    const meetingDate = this.lead.meetingDate
      ? this.formatDateTimeLocal(new Date(this.lead.meetingDate))
      : null;
    const followUpTime = this.lead.followUpTime
      ? this.formatDateTimeLocal(new Date(this.lead.followUpTime))
      : null;

    this.leadForm.patchValue({
      businessName: this.lead.businessName,
      whatsAppNumber: this.lead.whatsAppNumber,
      country: this.lead.country ?? '',
      occupation: this.lead.occupation ?? '',
      contactStatus: this.lead.contactStatus,
      currentLeadStatus: this.lead.currentLeadStatus,
      leadSource: this.lead.leadSource,
      interestLevel: this.lead.interestLevel,
      freelancePlatform: this.lead.freelancePlatform ?? null,
      responsibility: this.lead.responsibility ?? 0,
      servicesInterestedIn: this.lead.servicesInterestedIn?.map((s) => s.serviceId) ?? [],
      meetingDate,
      followUpTime,
      quotationSent: this.lead.quotationSent ?? false,
      assignedTo: this.lead.salesRepId ?? null,
    });

    // Reset notes array and editors to a single empty note (API may not return notes)
    while (this.notesFormArray.length > 1) {
      this.noteEditors[this.notesFormArray.length - 1].destroy();
      this.noteEditors.pop();
      this.notesFormArray.removeAt(this.notesFormArray.length - 1);
    }
    this.notesFormArray.at(0).setValue('');
  }

  private formatDateTimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${y}-${m}-${day}T${h}:${min}`;
  }

  loadLead(): void {
    this.isLoadingLead = true;
    const leadId = Number(this.route.snapshot.paramMap.get('id'));
    this.leadService.getById(leadId).subscribe({
      next: (response) => {
        this.lead = response;
        this.populateForm();
        this.isLoadingLead = false;
        this.loadNotes(leadId);
      },
      error: () => {
        this.isLoadingLead = false;
      },
    });
  }

  loadNotes(leadId: number): void {
    this.isLoadingNotes = true;
    this.leadOpsService.getNotes(leadId).subscribe({
      next: (list) => {
        this.notes = list;
        console.log(list)
        this.isLoadingNotes = false;
      },
      error: () => {
        this.notes = [];
        this.isLoadingNotes = false;
      },
    });
  }

  loadServices(): void {
    this.serviceService.getAll().subscribe((response) => (this.services = response));
  }

  loadEmployees(): void {
    this.authService.getAll().subscribe((response) => (this.employees = response));
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }
    if (!this.lead) return;

    this.isLoading = true;
    const formValue = this.leadForm.value;
    const leadId = this.lead.id;
    const serviceIds = (formValue.servicesInterestedIn || []).map((id: number | string) => Number(id));

    const payload: IUpdateLead = {
      id: leadId,
      businessName: formValue.businessName,
      whatsAppNumber: formValue.whatsAppNumber,
      country: formValue.country || undefined,
      occupation: formValue.occupation || undefined,
      contactStatus: Number(formValue.contactStatus),
      currentLeadStatus: Number(formValue.currentLeadStatus),
      leadSource: Number(formValue.leadSource),
      interestLevel: Number(formValue.interestLevel),
      freelancePlatform:
        this.isFreelancePlatforms && formValue.freelancePlatform != null
          ? Number(formValue.freelancePlatform)
          : undefined,
      responsibility: Number(formValue.responsibility),
      servicesInterestedIn: serviceIds,
      meetingDate: formValue.meetingDate ? new Date(formValue.meetingDate) : undefined,
      followUpTime: formValue.followUpTime ? new Date(formValue.followUpTime) : undefined,
      quotationSent: Boolean(formValue.quotationSent),
      salesRepId: formValue.assignedTo || undefined,
    };

    this.leadService.update(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.lead = response;
        this.populateForm();
        alert('تم تحديث العميل بنجاح');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Update failed', error);
        alert('فشل التحديث: ' + (error.error?.message || error.message));
      },
    });
  }

  deleteLead(): void {
    if (!this.lead) return;
    this.isDeleting = true;
    this.leadService.delete(this.lead.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/leads']);
      },
      error: (error) => {
        this.isDeleting = false;
        console.error(error);
      },
    });
  }
}
