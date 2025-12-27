import { MapTaskStatusPipe } from './../../../../core/pipes/map-task-status/map-task-status.pipe';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '../../../../model/auth/user';
import { AuthService } from '../../../../services/auth/auth.service';
import { NewTaskGroupComponent } from '../new-task-group/new-task-group.component';
import { TaskService } from '../../../../services/tasks/task.service';
import { IClientService } from '../../../../model/client/client';
import {
  CustomTaskStatus,
  ICreateTask,
  ITask,
  IUpdateTask,
} from '../../../../model/task/task';
import { MapTaskStatusClassPipe } from '../../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { AlertService } from '../../../../services/helper-services/alert.service';
import { hasError } from '../../../../services/helper-services/utils';

@Component({
  selector: 'app-task-groups',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NewTaskGroupComponent,
    MapTaskStatusPipe,
    MapTaskStatusClassPipe,
  ],
  templateUrl: './task-groups.component.html',
  styleUrl: './task-groups.component.css',
})
export class TaskGroupsComponent implements OnInit {
  @Input() clientServices: IClientService[] = [];
  @Input() clientId: number = 0;
  @Input() currentUserId: string = '';
  @Output() taskDataChanged = new EventEmitter<void>();

  @ViewChild('newTaskGroupModal') newTaskGroupModal!: NewTaskGroupComponent;

  isLoading: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isContentLeader: boolean = false;
  isDesignerLeader: boolean = false;

  alertMessage = '';
  alertType = 'info';

  // Modal and form related
  editTaskForm: FormGroup;
  modalMode: 'add' | 'edit' = 'add';
  selectedTask: ITask | null = null;
  selectedTaskGroupId: number | null = null;
  employees: User[] = [];

  // Bootstrap modal instance
  private modal: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taskService: TaskService,
  ) {
    this.editTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      taskType: ['', Validators.required],
      description: ['', Validators.maxLength(2000)],
      priority: ['', Validators.required],
      deadline: ['', Validators.required],
      employeeId: [''],
      status: ['', Validators.required],
      refrence: ['', Validators.maxLength(1000)]
    });
  }


  deleteTask(taskId: number) {
    this.taskService.deleteTask(taskId).subscribe({
      next: (response) => {
        this.showAlert('تم حذف المهمة بنجاح', 'success');
        this.taskDataChanged.emit();
      },
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.initializeModal();
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'مستعجل':
        return 'priority-high';
      case 'مهم':
        return 'priority-medium';
      case 'عادي':
        return 'priority-normal';
      default:
        return 'priority-normal';
    }
  }

  private initializeModal() {
    const modalElement = document.getElementById('taskModal');
    if (modalElement) {
      // @ts-ignore - Bootstrap types might not be available
      this.modal = new bootstrap.Modal(modalElement);
    }
  }

  private loadEmployees() {
    this.currentUserId = this.authService.getCurrentUserId();
    this.authService.getAll().subscribe({
      next: (users) => {
        this.employees = users;
      },
      error: () => {
        this.employees = [];
      },
    });
    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) this.isUserAdmin = true;
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) this.isUserAccountManager = true;
    });
    this.authService.isContentLeader().subscribe((isLeader) => {
      if (isLeader) this.isContentLeader = true;
    });
    this.authService.isDesignerLeader().subscribe((isLeader) => {
      if (isLeader) this.isDesignerLeader = true;
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
  }

  // Open modal for editing existing task
  openEditTaskModal(task: ITask): void {
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

  private populateForm(task: ITask): void {
    this.editTaskForm.patchValue({
      title: task.title,
      taskType: task.taskType,
      description: task.description || '',
      priority: task.priority,
      deadline: this.formatDateTimeForInput(task.deadline),
      employeeId: task.employeeId || '',
      status: task.status,
      refrence: task.refrence || '',
    });
  }

  private resetForm(): void {
    this.editTaskForm.reset({
      title: '',
      description: '',
      priority: '',
      deadline: '',
      employeeId: '',
      status: CustomTaskStatus.Open,
      refrence: '',
    });
  }

  private formatDateTimeForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  openDeleteModal(task: ITask): void {
    const modalId = `deleteModal-${task.id}`;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      // @ts-ignore - Bootstrap types might not be available
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private closeDeleteModal(taskId: number): void {
    const modalId = `deleteModal-${taskId}`;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      // @ts-ignore - Bootstrap types might not be available
      const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }

  confirmDelete(taskId: number): void {
    this.taskService.deleteTask(taskId).subscribe({
      next: (response) => {
        this.showAlert('تم حذف المهمة بنجاح', 'success');
        this.closeDeleteModal(taskId);
        this.taskDataChanged.emit();
      },
      error: (error) => {
        this.showAlert('فشل في حذف المهمة, حاول مرة اخرى', 'error');
      },
    });
  }

  saveTask(): void {
    if (this.editTaskForm.invalid || !this.selectedTaskGroupId) {
      this.editTaskForm.markAllAsTouched();
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
    debugger;
    if (!this.selectedTask) return;

    const updatedTask: IUpdateTask = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      deadline: new Date(formValue.deadline),
      employeeId: formValue.employeeId || this.selectedTask.employeeId,
      status: Number(formValue.status),
      refrence: formValue.refrence,
    };

    // Update local data
    this.taskService.update(this.selectedTask.id, this.currentUserId, updatedTask).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.hideModal();
        this.taskDataChanged.emit();
        this.showAlert('تم تحديث المهمة بنجاح', 'success');
      },
      error: (error) => {
        this.isSaving = false;
        this.showAlert(error.message, 'error');
      },
    });
  }

  private createNewTask(formValue: any): void {
    this.isSaving = true;
    const newTask: ICreateTask = {
      title: formValue.title,
      taskType: Number(formValue.taskType),
      description: formValue.description,
      clientServiceId: this.getClientServiceIdFromTaskGroup(
        this.selectedTaskGroupId!
      ),
      deadline: new Date(formValue.deadline),
      priority: formValue.priority,
      refrence: formValue.refrence,
      employeeId: formValue.employeeId,
      taskGroupId: this.selectedTaskGroupId!,
    };


    this.isSaving = true;
    this.taskService.addTask(newTask, this.currentUserId).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.hideModal();
        this.taskDataChanged.emit();
        this.showAlert('تم إضافة التاسك بنجاح', 'success');
      },
      error: (error) => {
        this.isSaving = false;
        this.showAlert(error.error, 'error');
        console.log(error)
      },
    });
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

  hasError(controlName: string): boolean {
    return hasError(this.editTaskForm, controlName)
  }

  getErrorMessage(controlName: string): string {
    const control = this.editTaskForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength']) {
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    }
    if (control.errors['maxlength']) {
      return `يجب ان يكون ${control.errors['maxlength'].requiredLength} أحرف على الاكثر`
    }

    return 'قيمة غير صحيحة';
  }

  openNewTaskGroupModal(): void {
    if (this.newTaskGroupModal) {
      this.newTaskGroupModal.openModal();
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
