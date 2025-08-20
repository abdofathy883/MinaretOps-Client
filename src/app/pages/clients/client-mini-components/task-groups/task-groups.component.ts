import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientServiceDTO, TaskDTO, CustomTaskStatus, CreateTaskDTO } from '../../../../model/client/client';
import { User } from '../../../../model/auth/user';
import { AuthService } from '../../../../services/auth/auth.service';
import { NewTaskGroupComponent } from '../new-task-group/new-task-group.component';

@Component({
  selector: 'app-task-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NewTaskGroupComponent],
  templateUrl: './task-groups.component.html',
  styleUrl: './task-groups.component.css'
})
export class TaskGroupsComponent implements OnInit {
  @Input() clientServices: ClientServiceDTO[] = [];
  @Input() clientId: number = 0;

  @ViewChild('newTaskGroupModal') newTaskGroupModal!: NewTaskGroupComponent;
  
  isLoading: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Modal and form related
  editTaskForm: FormGroup;
  modalMode: 'add' | 'edit' = 'add';
  selectedTask: TaskDTO | null = null;
  selectedTaskGroupId: number | null = null;
  employees: User[] = [];
  
  // Bootstrap modal instance
  private modal: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.editTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['', Validators.required],
      deadline: ['', Validators.required],
      employeeId: [''],
      status: ['', Validators.required],
      refrence: ['']
    });
  }

  onTaskGroupCreated(newTaskGroup: any): void {
    // Refresh the client services data or handle the new task group
    // You might want to emit an event to the parent component to refresh data
    console.log('New task group created:', newTaskGroup);
    
    // Optionally, you can add the new task group to the local data
    // or refresh the entire data from the server
  }

  ngOnInit() {
    this.loadEmployees();
    this.initializeModal();
  }

  private initializeModal() {
    const modalElement = document.getElementById('taskModal');
    if (modalElement) {
      // @ts-ignore - Bootstrap types might not be available
      this.modal = new bootstrap.Modal(modalElement);
    }
  }

  private loadEmployees() {
    this.authService.getAll().subscribe({
      next: (users) => {
        this.employees = users;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.employees = [];
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Open modal for editing existing task
  openEditTaskModal(task: TaskDTO): void {
    this.modalMode = 'edit';
    this.selectedTask = task;
    this.selectedTaskGroupId = task.taskGroupId;
    this.populateForm(task);
    this.showModal();
  }

  // Open modal for adding new task
  openAddTaskModal(taskGroupId: number): void {
    this.modalMode = 'add';
    this.selectedTask = null;
    this.selectedTaskGroupId = taskGroupId;
    this.resetForm();
    this.showModal();
  }

  private populateForm(task: TaskDTO): void {
    this.editTaskForm.patchValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: this.formatDateTimeForInput(task.deadline),
      employeeId: task.employeeId || '',
      status: task.status,
      refrence: task.refrence || ''
    });
  }

  private resetForm(): void {
    this.editTaskForm.reset({
      title: '',
      description: '',
      priority: '',
      deadline: '',
      employeeId: '',
      status: CustomTaskStatus.NotStarted,
      refrence: ''
    });
  }

  private formatDateTimeForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private showModal(): void {
    if (this.modal) {
      this.modal.show();
    }
  }

  private hideModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  saveTask(): void {
    if (this.editTaskForm.invalid || !this.selectedTaskGroupId) {
      return;
    }

    this.isSaving = true;
    const formValue = this.editTaskForm.value;

    if (this.modalMode === 'edit') {
      this.updateExistingTask(formValue);
    } else {
      this.createNewTask(formValue);
    }
  }

  private updateExistingTask(formValue: any): void {
    if (!this.selectedTask) return;

    const updatedTask: Partial<TaskDTO> = {
      id: this.selectedTask.id,
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      deadline: new Date(formValue.deadline),
      employeeId: formValue.employeeId || this.selectedTask.employeeId,
      status: formValue.status,
      refrence: formValue.refrence
    };

    // Update local data
    this.updateLocalTask(updatedTask);
    
    this.isSaving = false;
    this.hideModal();
    this.successMessage = 'تم تحديث المهمة بنجاح';
    this.showSuccessMessage();
  }

  private createNewTask(formValue: any): void {
    const newTask: CreateTaskDTO = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      clientServiceId: this.getClientServiceIdFromTaskGroup(this.selectedTaskGroupId!),
      deadline: new Date(formValue.deadline),
      priority: formValue.priority,
      refrence: formValue.refrence,
      employeeId: formValue.employeeId,
      taskGroupId: this.selectedTaskGroupId!
    };

    // Add to local data
    this.addLocalTask(newTask);
    
    this.isSaving = false;
    this.hideModal();
    this.successMessage = 'تم إضافة المهمة بنجاح';
    this.showSuccessMessage();
  }

  private getClientServiceIdFromTaskGroup(taskGroupId: number): number {
    for (const clientService of this.clientServices) {
      for (const taskGroup of clientService.taskGroups) {
        if (taskGroup.id === taskGroupId) {
          return clientService.id;
        }
      }
    }
    return 0;
  }

  private updateLocalTask(updatedTask: Partial<TaskDTO>): void {
    for (const clientService of this.clientServices) {
      for (const taskGroup of clientService.taskGroups) {
        const taskIndex = taskGroup.tasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          taskGroup.tasks[taskIndex] = { ...taskGroup.tasks[taskIndex], ...updatedTask };
          return;
        }
      }
    }
  }

  private addLocalTask(newTask: CreateTaskDTO): void {
    // Create a new TaskDTO from CreateTaskDTO
    const taskDTO: TaskDTO = {
      ...newTask,
      id: this.generateTempId(), // Temporary ID for local display
      isCompletedOnDeadline: false,
      clientName: '',
      serviceName: '',
      employeeName: this.getEmployeeName(newTask.employeeId),
      serviceId: 0,
      clientId: 0
    };

    // Find the task group and add the new task
    for (const clientService of this.clientServices) {
      for (const taskGroup of clientService.taskGroups) {
        if (taskGroup.id === newTask.taskGroupId) {
          taskGroup.tasks.push(taskDTO);
          return;
        }
      }
    }
  }

  private generateTempId(): number {
    // Generate a temporary negative ID for new tasks
    return -Math.floor(Math.random() * 1000000);
  }

  private getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'غير محدد';
  }

  private showSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'عالية':
        return 'bg-danger';
      case 'متوسطة':
        return 'bg-warning';
      case 'منخفضة':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatusClass(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Completed:
        return 'bg-success';
      case CustomTaskStatus.InProgress:
        return 'bg-primary';
      case CustomTaskStatus.Delivered:
        return 'bg-info';
      case CustomTaskStatus.NotStarted:
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Completed:
        return 'مكتمل';
      case CustomTaskStatus.InProgress:
        return 'قيد التنفيذ';
      case CustomTaskStatus.Delivered:
        return 'تم التسليم';
      case CustomTaskStatus.NotStarted:
      default:
        return 'لم يبدأ';
    }
  }

  goToTask(taskId: number) {
    
  }

  hasError(controlName: string): boolean {
    const control = this.editTaskForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.editTaskForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength']) {
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    }

    return 'قيمة غير صحيحة';
  }

  openNewTaskGroupModal(): void {
    if (this.newTaskGroupModal) {
      this.newTaskGroupModal.openModal();
    }
  }
}
