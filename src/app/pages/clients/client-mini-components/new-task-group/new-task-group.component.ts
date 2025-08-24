import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../../services/clients/client.service';
import { ServicesService } from '../../../../services/services/services.service';
import { TaskService } from '../../../../services/tasks/task.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { CreateTaskGroupDTO } from '../../../../model/client/client';

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
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private servicesService = inject(ServicesService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  taskGroupForm!: FormGroup;
  availableServices: any[] = [];
  employees: any[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private modal: any;

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
      clientServices: this.fb.array([])
    });
    
    // Add initial service
    this.addClientService();
  }

  private loadAvailableServices() {
    this.servicesService.getAll().subscribe({
      next: (services) => {
        this.availableServices = services;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.errorMessage = 'حدث خطأ في تحميل الخدمات';
      }
    });
  }

  private loadEmployees() {
    // Assuming you have a method to get all employees
    // You might need to adjust this based on your actual service
    this.authService.getAll().subscribe({
      next: (users) => {
        this.employees = users.filter((user: any) => user.role !== 'Admin');
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'حدث خطأ في تحميل الموظفين';
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
      tasks: this.fb.array([])
    });

    this.clientServicesArray.push(clientService);
    
    // Add initial task
    this.addTask(this.clientServicesArray.length - 1);
  }

  removeClientService(serviceIndex: number) {
    if (this.clientServicesArray.length > 1) {
      this.clientServicesArray.removeAt(serviceIndex);
    }
  }

  addTask(serviceIndex: number) {
    const task = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      employeeId: ['', Validators.required],
      deadline: ['', Validators.required],
      priority: ['عادي', Validators.required],
      refrence: ['']
    });

    this.getTasksArray(serviceIndex).push(task);
  }

  removeTask(serviceIndex: number, taskIndex: number) {
    const tasksArray = this.getTasksArray(serviceIndex);
    if (tasksArray.length > 1) {
      tasksArray.removeAt(taskIndex);
    }
  }

  toggleTaskCollapse(serviceIndex: number, taskIndex: number) {
    const key = `${serviceIndex}-${taskIndex}`;
    this.taskCollapseState[key] = !this.taskCollapseState[key];
  }

  isTaskCollapsed(serviceIndex: number, taskIndex: number): boolean {
    const key = `${serviceIndex}-${taskIndex}`;
    return this.taskCollapseState[key] || false;
  }

  onSubmit() {
    if (this.taskGroupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.taskGroupForm.value;
      
      // Transform the data to match your backend API structure
      // const taskGroupData : CreateTaskGroupDTO= {
      //   clientServices: formData.clientServices.map((service: any) => ({
      //     serviceId: service.serviceId,
      //     tasks: service.tasks.map((task: any) => ({
      //       title: task.title,
      //       description: task.description,
      //       employeeId: task.employeeId,
      //       deadline: task.deadline,
      //       priority: task.priority,
      //       refrence: task.refrence
      //     }))
      //   }))
      // };

      // Call your service to create the new task group
      // this.taskService.createTaskGroup(taskGroupData).subscribe({
      //   next: (response) => {
      //     this.isLoading = false;
      //     this.successMessage = 'تم إضافة الشهر الجديد بنجاح';
      //     this.resetForm();
          
      //     // Close modal after successful submission
      //     setTimeout(() => {
      //       const modal = document.getElementById('taskModal');
      //       if (modal) {
      //         const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal);
      //         if (bootstrapModal) {
      //           bootstrapModal.hide();
      //         }
      //       }
      //     }, 2000);
      //   },
      //   error: (error) => {
      //     this.isLoading = false;
      //     console.error('Error creating task group:', error);
      //     this.errorMessage = 'حدث خطأ في إضافة الشهر الجديد';
      //   }
      // });
    } else {
      this.markFormGroupTouched();
    }
  }

  resetForm() {
    this.taskGroupForm.reset();
    this.clientServicesArray.clear();
    this.addClientService();
    this.taskCollapseState = {};
    this.errorMessage = '';
    this.successMessage = '';
  }

  private markFormGroupTouched() {
    Object.keys(this.taskGroupForm.controls).forEach(key => {
      const control = this.taskGroupForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Helper methods for form validation
  hasError(controlName: string): boolean {
    const control = this.taskGroupForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.taskGroupForm.get(controlName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      // Add more validation messages as needed
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

  // Method to close the modal
  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }
}
