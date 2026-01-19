import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Service } from '../../../model/service/service';
import { ServicesService } from '../../../services/services/services.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import { ClientService } from '../../../services/clients/client.service';
import {
  BusinessType,
  ClientStatus,
  ICreateClient,
} from '../../../model/client/client';
import { CustomTaskStatus } from '../../../model/task/task';
import {
  getErrorMessage,
  hasError,
} from '../../../services/helper-services/utils';
import { CheckpointService } from '../../../services/checkpoints/checkpoint.service';
import { IServiceCheckpoint } from '../../../model/checkpoint/i-service-checkpoint';
import { COUNTRIES } from '../../../core/assets/countries';
import { NgxEditorComponent, NgxEditorMenuComponent, Editor, Toolbar } from 'ngx-editor'

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorComponent, NgxEditorMenuComponent],
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.css',
})
export class AddClientComponent implements OnInit, OnDestroy {
  clientForm: FormGroup;
  availableServices: Service[] = [];
  employees: User[] = [];
  currentUserId: string = '';
  editor!: Editor;
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

  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  collapsedTasks: Set<string> = new Set();
  countries = COUNTRIES;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private checkpointService: CheckpointService
  ) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/;
    this.clientForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.pattern(emailRegex)],
      ],
      personalPhoneNumber: ['', [Validators.required]],
      companyName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      companyNumber: [''],
      businessDescription: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],
      driveLink: ['', Validators.required],
      businessType: [0, Validators.required],
      businessActivity: [''],
      commercialRegisterNumber: [''],
      taxCardNumber: [''],
      accountManagerId: [''],
      country: [''],
      status: [ClientStatus.Active],
      clientServices: this.fb.array([]),
    });
  }

  serviceCheckpointsMap: Map<number, IServiceCheckpoint[]> = new Map();
  selectedCheckpointsMap: Map<number, Set<number>> = new Map();

  getCheckpointsForService(serviceId: number): IServiceCheckpoint[] {
    return this.serviceCheckpointsMap.get(serviceId) || [];
  }

  // Add methods for checkpoint selection
  onServiceSelected(serviceIndex: number, serviceId: number): void {
    // Reset selected checkpoints when service changes
    this.selectedCheckpointsMap.set(serviceIndex, new Set<number>());

    if (serviceId) {
      this.checkpointService.getServiceCheckpoints(serviceId).subscribe({
        next: (checkpoints) => {
          this.serviceCheckpointsMap.set(serviceId, checkpoints);
        },
        error: () => {
          // Silently fail - checkpoints will be initialized on backend
        },
      });
    }
  }

  toggleCheckpointSelection(serviceIndex: number, checkpointId: number): void {
    if (!this.selectedCheckpointsMap.has(serviceIndex)) {
      this.selectedCheckpointsMap.set(serviceIndex, new Set<number>());
    }

    const selectedSet = this.selectedCheckpointsMap.get(serviceIndex)!;
    if (selectedSet.has(checkpointId)) {
      selectedSet.delete(checkpointId);
    } else {
      selectedSet.add(checkpointId);
    }
  }

  isCheckpointSelected(serviceIndex: number, checkpointId: number): boolean {
    const selectedSet = this.selectedCheckpointsMap.get(serviceIndex);
    return selectedSet ? selectedSet.has(checkpointId) : false;
  }

  getSelectedCheckpoints(serviceIndex: number): number[] {
    const selectedSet = this.selectedCheckpointsMap.get(serviceIndex);
    return selectedSet ? Array.from(selectedSet) : [];
  }

  get clientServicesArray(): FormArray {
    return this.clientForm.get('clientServices') as FormArray;
  }

  get isCommercial(): boolean {
    return (
      Number(this.clientForm.get('businessType')?.value) ===
      BusinessType.Commercial
    );
  }

  addClientService(): void {
    const clientServiceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      serviceCost: [''],
      tasks: this.fb.array([]),
    });
    this.clientServicesArray.push(clientServiceGroup);

    // Initialize selected checkpoints for this service
    const serviceIndex = this.clientServicesArray.length - 1;
    this.selectedCheckpointsMap.set(serviceIndex, new Set<number>());
  }

  removeClientService(index: number): void {
    this.clientServicesArray.removeAt(index);
    this.cleanupCollapsedTasks(index);
    this.selectedCheckpointsMap.delete(index);

    // Reindex the map
    const newMap = new Map<number, Set<number>>();
    this.selectedCheckpointsMap.forEach((value, key) => {
      if (key < index) {
        newMap.set(key, value);
      } else if (key > index) {
        newMap.set(key - 1, value);
      }
    });
    this.selectedCheckpointsMap = newMap;
  }

  getTasksArray(clientServiceIndex: number): FormArray {
    return this.clientServicesArray
      .at(clientServiceIndex)
      .get('tasks') as FormArray;
  }

  addTask(clientServiceIndex: number): void {
    const task = this.fb.group({
      taskType: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: [CustomTaskStatus.Open],
      clientServiceId: [0],
      deadline: ['', Validators.required],
      priority: ['عادي'],
      refrence: [''],
      employeeId: ['', Validators.required],
      taskGroupId: [0],
      numberOfSubTasks: [0],
    });
    this.getTasksArray(clientServiceIndex).push(task);

    // Auto-collapse new tasks to keep interface clean
    const taskIndex = this.getTasksArray(clientServiceIndex).length - 1;
    this.collapseTask(clientServiceIndex, taskIndex);
  }

  removeTask(clientServiceIndex: number, taskIndex: number): void {
    this.getTasksArray(clientServiceIndex).removeAt(taskIndex);
    // Clean up collapsed state for this task
    this.removeCollapsedTask(clientServiceIndex, taskIndex);
  }

  // Task collapse methods
  toggleTaskCollapse(serviceIndex: number, taskIndex: number): void {
    const key = this.getTaskKey(serviceIndex, taskIndex);
    if (this.collapsedTasks.has(key)) {
      this.collapsedTasks.delete(key);
    } else {
      this.collapsedTasks.add(key);
    }
  }

  isTaskCollapsed(serviceIndex: number, taskIndex: number): boolean {
    const key = this.getTaskKey(serviceIndex, taskIndex);
    return this.collapsedTasks.has(key);
  }

  collapseTask(serviceIndex: number, taskIndex: number): void {
    const key = this.getTaskKey(serviceIndex, taskIndex);
    this.collapsedTasks.add(key);
  }

  expandTask(serviceIndex: number, taskIndex: number): void {
    const key = this.getTaskKey(serviceIndex, taskIndex);
    this.collapsedTasks.delete(key);
  }

  private getTaskKey(serviceIndex: number, taskIndex: number): string {
    return `${serviceIndex}-${taskIndex}`;
  }

  private removeCollapsedTask(serviceIndex: number, taskIndex: number): void {
    const key = this.getTaskKey(serviceIndex, taskIndex);
    this.collapsedTasks.delete(key);
  }

  private cleanupCollapsedTasks(serviceIndex: number): void {
    // Remove all collapsed tasks for a specific service
    const keysToRemove: string[] = [];
    this.collapsedTasks.forEach((key) => {
      if (key.startsWith(`${serviceIndex}-`)) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => this.collapsedTasks.delete(key));
  }

  loadEmployees(): void {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      },
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.loadAvailableServices();
    this.loadEmployees();
    this.addClientService();
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editor.destroy();
  }

  loadAvailableServices(): void {
    this.servicesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.availableServices = services;
        },
        error: (error) => {
          this.showAlert('حدث خطأ أثناء تحميل الخدمات المتاحة', 'error');
        },
      });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.clientForm.value;

    const clientData: ICreateClient = {
      name: formValue.name,
      companyName: formValue.companyName || undefined,
      personalPhoneNumber: formValue.personalPhoneNumber,
      companyNumber: formValue.companyNumber || undefined,
      email: formValue.email,
      businessDescription: formValue.businessDescription,
      driveLink: formValue.driveLink,
      businessType: Number(formValue.businessType),
      businessActivity: formValue.businessActivity || undefined,
      commercialRegisterNumber: formValue.commercialRegisterNumber || undefined,
      taxCardNumber: formValue.taxCardNumber || undefined,
      country: formValue.country || undefined,
      accountManagerId: formValue.accountManagerId || undefined,
      status: formValue.status,
      clientServices: formValue.clientServices.map(
        (cs: any, index: number) => ({
          serviceId: cs.serviceId,
          selectedCheckpointIds: this.getSelectedCheckpoints(index),
          taskGroups: [
            {
              tasks: cs.tasks.map((t: any) => ({
                taskType: parseInt(t.taskType),
                title: t.title,
                description: t.description,
                status: t.status,
                deadline: new Date(t.deadline),
                priority: t.priority,
                refrence: t.refrence || undefined,
                employeeId: t.employeeId,
                numberOfSubTasks: t.numberOfSubTasks || 0,
              })),
            },
          ],
        })
      ),
    };

    console.log('Submitting client data:', clientData);

    this.clientService.add(clientData, this.currentUserId).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم اضافة العميل بنجاح', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert(err.error, 'error');
        console.log('Error adding client:', err);
      },
    });
  }

  resetForm(): void {
    this.clientForm.reset({
      status: ClientStatus.Active,
    });
    this.clientServicesArray.clear();
    this.addClientService();
    this.collapsedTasks.clear();
    this.selectedCheckpointsMap.clear();
  }

  hasError(controlName: string): boolean {
    return hasError(this.clientForm, controlName);
  }

  getErrorMessage(controlName: string): string {
    return getErrorMessage(this.clientForm, controlName);
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
