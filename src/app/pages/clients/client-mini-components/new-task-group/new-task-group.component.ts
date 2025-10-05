import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ServicesService } from '../../../../services/services/services.service';
import { TaskService } from '../../../../services/tasks/task.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ICreateTaskGroup } from '../../../../model/task/task';
import { AlertService } from '../../../../services/helper-services/alert.service';
import { hasError } from '../../../../services/helper-services/utils';

@Component({
  selector: 'app-new-task-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-task-group.component.html',
  styleUrl: './new-task-group.component.css',
})
export class NewTaskGroupComponent implements OnInit {
  @Input() clientId: number = 0;
  @Output() taskGroupCreated = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private taskService: TaskService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  taskGroupForm!: FormGroup;
  availableServices: any[] = [];
  employees: any[] = [];
  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  private modal: any;
  collapsedTasks: Set<string> = new Set();

  // Task collapse state tracking
  private taskCollapseState: { [key: string]: boolean } = {};

  ngOnInit() {
    this.initializeForm();
    this.loadAvailableServices();
    this.loadEmployees();
    this.initializeModal();
  }

  private initializeForm() {
    this.taskGroupForm = this.fb.group({
      clientServices: this.fb.array([]),
    });
    this.addClientService();
  }

  private loadAvailableServices() {
    this.servicesService.getAll().subscribe({
      next: (services) => {
        this.availableServices = services;
      }
    });
  }

  private loadEmployees() {
    this.authService.getAll().subscribe({
      next: (users) => {
        this.employees = users.filter((user: any) => user.role !== 'Admin');
      }
    });
  }

  get clientServicesArray() {
    return this.taskGroupForm.get('clientServices') as FormArray;
  }

  getTasksArray(serviceIndex: number) {
    return this.clientServicesArray.at(serviceIndex).get('tasks') as FormArray;
  }

  addClientService() {
    const clientService = this.fb.group({
      serviceId: ['', Validators.required],
      tasks: this.fb.array([]),
    });

    this.clientServicesArray.push(clientService);

    // Add initial task
    // this.addTask(this.clientServicesArray.length - 1);
  }

  removeClientService(serviceIndex: number) {
    if (this.clientServicesArray.length > 1) {
      this.clientServicesArray.removeAt(serviceIndex);
    }
  }

  addTask(serviceIndex: number) {
    const task = this.fb.group({
      taskType: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      employeeId: ['', Validators.required],
      deadline: ['', Validators.required],
      priority: ['عادي', Validators.required],
      refrence: [''],
    });

    this.getTasksArray(serviceIndex).push(task);
  }

  removeTask(serviceIndex: number, taskIndex: number) {
    const tasksArray = this.getTasksArray(serviceIndex);
    if (tasksArray.length > 1) {
      tasksArray.removeAt(taskIndex);
    }
  }

  isTaskCollapsed(serviceIndex: number, taskIndex: number): boolean {
    const key = `${serviceIndex}-${taskIndex}`;
    return this.collapsedTasks.has(key);
  }

  toggleTaskCollapse(serviceIndex: number, taskIndex: number): void {
    const key = `${serviceIndex}-${taskIndex}`;
    if (this.collapsedTasks.has(key)) {
      this.collapsedTasks.delete(key);
    } else {
      this.collapsedTasks.add(key);
    }
  }

  onSubmit() {
    if (this.taskGroupForm.valid) {
      this.isLoading = true;

      const formData = this.taskGroupForm.value;

      const taskGroup: ICreateTaskGroup = {
        clientId: this.clientId,
        serviceId: Number(formData.clientServices[0].serviceId),
        clientServiceId: 0,
        tasks: formData.clientServices[0].tasks.map((task: any) => ({
          taskType: Number(task.taskType),
          title: task.title,
          description: task.description,
          employeeId: task.employeeId,
          deadline: task.deadline,
          priority: task.priority,
          refrence: task.refrence,
        })),
      };

      console.log(taskGroup);

      this.taskService.addTaskGroup(taskGroup).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showAlert('تم إضافة الشهر الجديد بنجاح', 'success');
          this.resetForm();

          // Close modal after successful submission
          setTimeout(() => {
            const modal = document.getElementById('taskModal');
            if (modal) {
              const bootstrapModal = (
                window as any
              ).bootstrap?.Modal?.getInstance(modal);
              if (bootstrapModal) {
                bootstrapModal.hide();
              }
            }
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.showAlert(error.message, 'error');

          console.log(error);
        },
      });
    } else {
      this.taskGroupForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.taskGroupForm.reset();
    this.clientServicesArray.clear();
    this.addClientService();
    this.taskCollapseState = {};
  }

  hasError(controlName: string): boolean {
    return hasError(this.taskGroupForm, controlName);
  }

  getErrorMessage(controlName: string): string {
    const control = this.taskGroupForm.get(controlName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
    }
    return '';
  }

  private initializeModal() {
    const modalElement = document.getElementById('newTaskGroupModal');
    if (modalElement) {
      // @ts-ignore - Bootstrap types might not be available
      this.modal = new bootstrap.Modal(modalElement);
    }
  }

  openModal(): void {
    if (this.modal) {
      this.modal.show();
    }
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
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
