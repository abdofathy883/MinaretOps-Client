import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ContactStatus,
  CurrentLeadStatus,
  FreelancePlatform,
  ICreateLeadNote,
  ILeadNote,
  ISalesLead,
  IUpdateLead,
  LeadBudget,
  LeadSource,
  LeadTimeline,
  NeedsExpectation,
  InterestLevel,
  LeadResponsibility,
} from '../../../model/sales/i-sales-lead';
import { LeadService } from '../../../services/sales/lead.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../../services/services/services.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { hasError } from '../../../services/helper-services/utils';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, Toolbar } from 'ngx-editor';
import { LeadsOpsService } from '../../../services/sales/sales-ops/leads-ops.service';
import { TaskShimmerComponent } from "../../../shared/task-shimmer/task-shimmer.component";

@Component({
  selector: 'app-single-lead',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxEditorComponent,
    NgxEditorMenuComponent,
    TaskShimmerComponent
],
  templateUrl: './single-lead.component.html',
  styleUrl: './single-lead.component.css',
})
export class SingleLeadComponent implements OnInit, OnDestroy {
  lead!: ISalesLead;
  notes: ILeadNote[] = [];
  services: Service[] = [];
  employees: User[] = [];
  leadForm!: FormGroup;
  isLoading = false;
  isLoadingLead = false;
  isDeleting = false;
  isLoadingNotes = false;
  isEditMode = false;
  isSubmittingNotes = false;

  /** New notes section (separate from update form): one or more editors to add notes */
  newNotesForm!: FormGroup;
  newNoteEditors: Editor[] = [new Editor()];
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

  ContactStatus = ContactStatus;
  CurrentLeadStatus = CurrentLeadStatus;
  LeadSource = LeadSource;
  InterestLevel = InterestLevel;
  FreelancePlatform = FreelancePlatform;
  LeadResponsibility = LeadResponsibility;

  constructor(
    private leadService: LeadService,
    private leadOpsService: LeadsOpsService,
    private serviceService: ServicesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.newNotesForm = this.fb.group({
      notes: this.fb.array([this.fb.control('')]),
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadServices();
    this.loadEmployees();
    this.loadLead();
  }

  ngOnDestroy(): void {
    this.newNoteEditors.forEach((e) => e.destroy());
    this.newNoteEditors = [];
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
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.populateForm();
  }

  cancelEdit(): void {
    this.isEditMode = false;
  }

  get newNotesFormArray(): FormArray {
    return this.newNotesForm.get('notes') as FormArray;
  }

  /** New notes (add-only) section */
  addNewNoteSlot(): void {
    this.newNotesFormArray.push(this.fb.control(''));
    this.newNoteEditors.push(new Editor());
  }

  removeNewNoteSlot(index: number): void {
    if (this.newNotesFormArray.length > 1) {
      this.newNoteEditors[index].destroy();
      this.newNoteEditors.splice(index, 1);
      this.newNotesFormArray.removeAt(index);
    }
  }

  getNewNoteEditor(index: number): Editor {
    return this.newNoteEditors[index];
  }

  submitNewNotes(): void {
    if (this.lead) {
      const toCreate: string[] = this.newNotesFormArray.controls
        .map((c) => (c.value as string)?.trim())
        .filter((s) => s && s.length > 0);
      if (toCreate.length === 0) return;
  
      this.isSubmittingNotes = true;
      const createOne = (index: number): void => {
        if (index >= toCreate.length) {
          this.isSubmittingNotes = false;
          this.clearNewNotesSlots();
          this.loadNotes(this.lead.id);
          return;
        }
        const dto: ICreateLeadNote = {
          leadId: this.lead.id,
          note: toCreate[index]
        };
        this.leadOpsService.createNote(dto).subscribe({
          next: () => createOne(index + 1),
          error: () => {
            this.isSubmittingNotes = false;
          },
        });
      };
      createOne(0);
    }
      
  }

  private clearNewNotesSlots(): void {
    const arr = this.newNotesFormArray;
    while (arr.length > 1) {
      this.newNoteEditors[arr.length - 1].destroy();
      this.newNoteEditors.pop();
      arr.removeAt(arr.length - 1);
    }
    arr.at(0).setValue('');
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
      budget: this.lead.budget,
      timeline: this.lead.timeline,
      needsExpectation: this.lead.needsExpectation,
      servicesInterestedIn: this.lead.servicesInterestedIn?.map((s) => s.serviceId) ?? [],
      meetingDate: this.lead.meetingDate,
      followUpTime: this.lead.followUpTime,
      quotationSent: this.lead.quotationSent ?? false,
      assignedTo: this.lead.salesRepId ?? null,
    });
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
        this.loadNotes(this.lead.id);
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
      error: (error) => {
        console.log(error)
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
    const serviceIds = (formValue.servicesInterestedIn || []).map((id: number | string) => Number(id));

    const payload: IUpdateLead = {
      id: this.lead.id,
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
      budget: Number(formValue.budget),
      timeLine: Number(formValue.timeline),
      needsExpectations: Number(formValue.needsExpectation),
      servicesInterestedIn: serviceIds,
      meetingDate: formValue.meetingDate ? new Date(formValue.meetingDate) : undefined,
      followUpTime: formValue.followUpTime ? new Date(formValue.followUpTime) : undefined,
      quotationSent: Boolean(formValue.quotationSent),
      salesRepId: formValue.assignedTo || undefined,
    };

    console.log(payload)

    this.leadService.update(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.lead = response;
        this.populateForm();
        this.isEditMode = false;
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
        this.hideDeleteModalAndNavigate();
      },
      error: (error) => {
        this.isDeleting = false;
        console.error(error);
      },
    });
  }

  private hideDeleteModalAndNavigate(): void {
    const modalEl = document.getElementById('deleteModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        const onHidden = () => {
          modalEl.removeEventListener('hidden.bs.modal', onHidden);
          this.router.navigate(['/leads']);
        };
        modalEl.addEventListener('hidden.bs.modal', onHidden);
        modal.hide();
        return;
      }
    }
    this.router.navigate(['/leads']);
  }

  getContactStatusLabel(v: ContactStatus): string {
    const m: Record<ContactStatus, string> = {
      [ContactStatus.NotContactedYet]: 'لم يتم التواصل بعد',
      [ContactStatus.ContactedWithNoReply]: 'تم التواصل بدون رد',
      [ContactStatus.ContactedAndReplied]: 'تم الاتصال وتم الرد',
      [ContactStatus.WrongNumber]: 'الرقم غير صحيح',
    };
    return m[v] ?? '';
  }

  getCurrentLeadStatusLabel(v: CurrentLeadStatus): string {
    const m: Record<CurrentLeadStatus, string> = {
      [CurrentLeadStatus.NewLead]: 'عميل جديد',
      [CurrentLeadStatus.FirstCall]: 'اتصال أولي',
      [CurrentLeadStatus.Interested]: 'مهتم',
      [CurrentLeadStatus.MeetingAgreed]: 'اجتماع',
      [CurrentLeadStatus.Potential]: 'محتمل',
      [CurrentLeadStatus.Deal]: 'Deal',
      [CurrentLeadStatus.NotPotential]: 'غير محتمل',
    };
    return m[v] ?? '';
  }

  getLeadSourceLabel(v: LeadSource): string {
    const m: Record<LeadSource, string> = {
      [LeadSource.Facebook]: 'Facebook',
      [LeadSource.Instagram]: 'Instagram',
      [LeadSource.LinkedIn]: 'LinkedIn',
      [LeadSource.Referral]: 'Referral',
      [LeadSource.GoogleMaps]: 'Google Maps',
      [LeadSource.Website]: 'Website',
      [LeadSource.FreelancingPlatforms]: 'Freelance Platforms',
    };
    return m[v] ?? '';
  }

  getInterestLevelLabel(v: InterestLevel): string {
    const m: Record<InterestLevel, string> = {
      [InterestLevel.Cold]: 'منخفض',
      [InterestLevel.Warm]: 'متوسط',
      [InterestLevel.Hot]: 'مرتفع',
    };
    return m[v] ?? '';
  }

  getFreelancePlatformLabel(v: FreelancePlatform): string {
    const m: Record<FreelancePlatform, string> = {
      [FreelancePlatform.Bahr]: 'Bahr',
      [FreelancePlatform.Upwork]: 'Upwork',
    };
    return m[v] ?? '';
  }

  getResponsibilityLabel(v: LeadResponsibility): string {
    const m: Record<LeadResponsibility, string> = {
      [LeadResponsibility.Responsible_DecisionMaker]: 'المسئول وصاحب القرار',
      [LeadResponsibility.Responsible_NOT_DecisionMaker]: 'المسئول وليس صاحب القرار',
      [LeadResponsibility.NotResponsible]: 'ليس المسئول',
    };
    return m[v] ?? '';
  }

  getServicesInterestedInDisplay(): string {
    if (!this.lead?.servicesInterestedIn?.length) return '—';
    return this.lead.servicesInterestedIn.map((s) => s.serviceTitle).join('، ');
  }

  hasAnyNewNoteContent(): boolean {
    return this.newNotesFormArray.controls.some(
      (c) => (c.value || '').toString().trim().length > 0
    );
  }

  /** Whether the history property is a date (for formatting in template) */
  isDateProperty(propertyName: string): boolean {
    return propertyName === 'تاريخ الاجتماع' || propertyName === 'تاريخ المتابعة';
  }

  getQualificationLabel(score: number): string {
    if (score <= 3) return 'ضعيف';
    if (score <= 6) return 'متوسط';
    return 'مرتفع';
  }

  getBudgetScore(): number {
    const m: Record<number, number> = { [LeadBudget.Below]: 0, [LeadBudget.Equal]: 2, [LeadBudget.Higher]: 4 };
    return m[this.lead?.budget] ?? 0;
  }
  getBudgetScorePercent(): number { return (this.getBudgetScore() / 4) * 100; }

  getResponsibilityScore(): number {
    const m: Record<number, number> = {
      [LeadResponsibility.NotResponsible]: 0,
      [LeadResponsibility.Responsible_NOT_DecisionMaker]: 1,
      [LeadResponsibility.Responsible_DecisionMaker]: 2
    };
    return m[this.lead?.responsibility] ?? 0;
  }
  getResponsibilityScorePercent(): number { return (this.getResponsibilityScore() / 2) * 100; }

  getInterestScore(): number {
    const m: Record<number, number> = { [InterestLevel.Cold]: 0, [InterestLevel.Warm]: 1, [InterestLevel.Hot]: 2 };
    return m[this.lead?.interestLevel] ?? 0;
  }
  getInterestScorePercent(): number { return (this.getInterestScore() / 2) * 100; }

  getTimelineScore(): number {
    const m: Record<number, number> = { [LeadTimeline.Below]: 0, [LeadTimeline.Equal]: 0.5, [LeadTimeline.Higher]: 1 };
    return m[this.lead?.timeline] ?? 0;
  }
  getTimelineScorePercent(): number { return (this.getTimelineScore() / 1) * 100; }

  getNeedsScore(): number {
    const m: Record<number, number> = { [NeedsExpectation.Below]: 0, [NeedsExpectation.Equal]: 0.5, [NeedsExpectation.Higher]: 1 };
    return m[this.lead?.needsExpectation] ?? 0;
  }
  getNeedsScorePercent(): number { return (this.getNeedsScore() / 1) * 100; }
}
