import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../../services/sales/lead.service';
import { ServicesService } from '../../../services/services/services.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { hasError } from '../../../services/helper-services/utils';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, Toolbar } from 'ngx-editor';
import { ICreateLead, LeadSource } from '../../../model/sales/i-sales-lead';

@Component({
  selector: 'app-add-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorComponent, NgxEditorMenuComponent],
  templateUrl: './add-lead.component.html',
  styleUrl: './add-lead.component.css',
})
export class AddLeadComponent implements OnInit, OnDestroy {
  leadForm!: FormGroup;
  availableServices: Service[] = [];
  employees: User[] = [];
  currentUserId: string = '';
  @Output() created = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  isLoading = false;

  alertMessage = '';
  alertType = 'info';

  /** One Editor per note so adding a note doesn't reset previous editors */
  noteEditors: Editor[] = [];
  toolbar: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    // or, set options for link:
    //[{ link: { showOpenInNewTab: false } }, 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear', 'indent', 'outdent'],
    ['superscript', 'subscript'],
    ['undo', 'redo'],
  ];

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

  ngOnDestroy(): void {
    this.noteEditors.forEach((e) => e.destroy());
    this.noteEditors = [];
  }

  initializeForm() {
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
        leadId: 0,
      }),
    );

    const noteValues = (formValue.notes || []) as string[];
    const notesDTO = noteValues
      .filter((n) => n != null && String(n).trim() !== '')
      .map((note) => ({
        note: note.trim(),
        leadId: 0,
      }));

    const newLead: ICreateLead = {
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
      servicesInterestedIn: servicesDTO,
      meetingDate: formValue.meetingDate ? new Date(formValue.meetingDate) : undefined,
      followUpTime: formValue.followUpTime ? new Date(formValue.followUpTime) : undefined,
      quotationSent: Boolean(formValue.quotationSent),
      salesRepId: formValue.assignedTo || undefined,
      createdById: this.currentUserId,
      notes: notesDTO.length > 0 ? notesDTO : undefined,
    };

    this.leadService.create(newLead).subscribe({
      next: () => {
        this.isLoading = false;
        this.created.emit();
        this.leadForm.reset();
        this.leadForm.patchValue({ servicesInterestedIn: [] });
        this.noteEditors.forEach((e) => e.destroy());
        this.noteEditors = [new Editor()];
        this.notesFormArray.clear();
        this.notesFormArray.push(this.fb.control(''));
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
