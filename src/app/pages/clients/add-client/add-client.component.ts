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
import { ClientStatus, ICreateClient } from '../../../model/client/client';
import { CustomTaskStatus } from '../../../model/task/task';
import {
  getErrorMessage,
  hasError,
} from '../../../services/helper-services/utils';

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.css',
})
export class AddClientComponent implements OnInit, OnDestroy {
  clientForm: FormGroup;
  availableServices: Service[] = [];
  employees: User[] = [];
  currentUserId: string = '';

  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  collapsedTasks: Set<string> = new Set();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private authService: AuthService,
    private clientService: ClientService
  ) {
    this.clientForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
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
      discordChannelId: ['', [Validators.required, Validators.maxLength(20)]],
      status: [ClientStatus.Active],
      clientServices: this.fb.array([]),
    });
  }

  get clientServicesArray(): FormArray {
    return this.clientForm.get('clientServices') as FormArray;
  }

  addClientService(): void {
    const clientServiceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      tasks: this.fb.array([]),
    });
    this.clientServicesArray.push(clientServiceGroup);
  }

  removeClientService(index: number): void {
    this.clientServicesArray.removeAt(index);
    this.cleanupCollapsedTasks(index);
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
    this.loadAvailableServices();
    this.loadEmployees();
    this.addClientService();
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          this.showAlert(
            'حدث خطأ أثناء تحميل الخدمات المتاحة',
            'error'
          );
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
      businessDescription: formValue.businessDescription,
      driveLink: formValue.driveLink,
      status: formValue.status,
      clientServices: formValue.clientServices.map((cs: any) => ({
        serviceId: cs.serviceId,
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
            })),
          },
        ],
      })),
    };

    this.clientService.add(clientData, this.currentUserId).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم اضافة العميل بنجاح', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert(err.error, 'error');
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
