import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  CustomTaskStatus,
  ITask,
  IUpdateTask,
  TaskType,
} from '../../../model/task/task';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../model/auth/user';

@Component({
  selector: 'app-single-task',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.css',
})
export class SingleTaskComponent implements OnInit {
  task!: ITask;
  updatingStatus = false;
  isEditMode: boolean = false;
  errorMessage = '';
  successMessage = '';
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isUserContentLeader: boolean = false;
  isUserDesignLeader: boolean = false;
  editTaskForm!: FormGroup;
  employees: User[] = [];
  isLoading: boolean = false;

  availableStatuses = [
    { value: CustomTaskStatus.Open, label: 'لم تبدأ', icon: 'bi bi-clock' },
    {
      value: CustomTaskStatus.Acknowledged,
      label: 'تم الإقرار',
      icon: 'bi bi-hand-thumbs-up',
    },
    {
      value: CustomTaskStatus.InProgress,
      label: 'قيد التنفيذ',
      icon: 'bi bi-play-circle',
    },
    {
      value: CustomTaskStatus.UnderReview,
      label: 'قيد المراجعة',
      icon: 'bi bi-eye',
    },
    {
      value: CustomTaskStatus.NeedsEdits,
      label: 'تحتاج إلى تعديلات',
      icon: 'bi bi-pencil-fill',
    },
    {
      value: CustomTaskStatus.Completed,
      label: 'مكتمل',
      icon: 'bi bi-rocket-takeoff-fill',
    },
  ];
  CustomTaskStatus = CustomTaskStatus;
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      taskType: ['', Validators.required],
      description: [''],
      priority: ['', Validators.required],
      deadline: ['', Validators.required],
      employeeId: [''],
      status: ['', Validators.required],
      refrence: [''],
    });
  }

  ngOnInit(): void {
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    const taskId = Number(taskIdParam);
    this.taskService.getById(taskId).subscribe({
      next: (response) => {
        this.task = response;
        console.log(response);
      },
    });

    this.authService.getAll().subscribe((response) => {
      this.employees = response;
    });

    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) this.isUserAdmin = true;
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) this.isUserAccountManager = true;
    });
    this.authService.isContentLeader().subscribe((isLeader) => {
      if (isLeader) this.isUserContentLeader = true;
    });
    this.authService.isDesignerLeader().subscribe((isLeader) => {
      if (isLeader) this.isUserDesignLeader = true;
    });
  }

  private populateForm(task: ITask): void {
    this.editTaskForm.patchValue({
      title: task.title,
      taskType: task.taskType,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline,
      employeeId: task.employeeId || '',
      status: task.status,
      refrence: task.refrence || '',
    });
  }

  getStatusLabel(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open:
        return 'لم تبدأ';
      case CustomTaskStatus.Acknowledged:
        return 'تم الإقرار';
      case CustomTaskStatus.InProgress:
        return 'قيد التنفيذ';
      case CustomTaskStatus.UnderReview:
        return 'قيد المراجعة';
      case CustomTaskStatus.NeedsEdits:
        return 'تحتاج إلى تعديلات';
      case CustomTaskStatus.Completed:
        return 'مكتمل';
      default:
        return 'غير محدد';
    }
  }

  getTypeLabel(type: TaskType): string {
    switch (type) {
      case TaskType.Ad_Management:
        return 'Ad Management';
      case TaskType.Backend:
        return 'Backend';
      case TaskType.ContentStrategy:
        return 'Content Strategy';
      case TaskType.ContentWriting:
        return 'Content Writing';
      case TaskType.DesignDirections:
        return 'Design Directions';
      case TaskType.E_mailMarketing:
        return 'E-mail Marketing';
      case TaskType.Frontend:
        return 'Frontend';
      case TaskType.HostingManagement:
        return 'Hosting Management';
      case TaskType.Illustrations:
        return 'Illustrations';
      case TaskType.LogoDesign:
        return 'Logo Design';
      case TaskType.Meeting:
        return 'Meeting';
      case TaskType.Moderation:
        return 'Moderation';
      case TaskType.Motion:
        return 'Motion';
      case TaskType.Planning:
        return 'Planning';
      case TaskType.PrintingsDesign:
        return 'Printings Design';
      case TaskType.Publishing:
        return 'Publishing';
      case TaskType.SEO:
        return 'SEO';
      case TaskType.SM_Design:
        return 'SM Design';
      case TaskType.UI_UX:
        return 'UI/UX';
      case TaskType.VideoEditing:
        return 'Video Editing';
      case TaskType.VisualIdentity:
        return 'Visual Identity';
      case TaskType.Voiceover:
        return 'Voiceover';
      case TaskType.WhatsAppMarketing:
        return 'WhatsApp Marketing';
      case TaskType.WordPress:
        return 'WordPress';
      default:
        return 'غير محدد';
    }
  }

  getStatusClass(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open:
        return 'status-not-started';
      case CustomTaskStatus.Acknowledged:
        return 'status-acknowledged';
      case CustomTaskStatus.InProgress:
        return 'status-in-progress';
      case CustomTaskStatus.UnderReview:
        return 'status-under-review';
      case CustomTaskStatus.NeedsEdits:
        return 'status-needs-edits';
      case CustomTaskStatus.Completed:
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  }

  updateTaskStatus(newStatus: CustomTaskStatus): void {
    if (!this.task) return;

    this.updatingStatus = true;

    this.taskService.changeStatus(this.task.id, newStatus).subscribe({
      next: () => {
        if (this.task) {
          this.task.status = newStatus;

          // Update CompletedAt field
          if (newStatus === CustomTaskStatus.Completed) {
            this.task.completedAt = new Date();
          } else {
            this.task.completedAt = undefined;
          }
        }
        this.updatingStatus = false;
      },
      error: (err) => {
        this.updatingStatus = false;
        console.error('Error updating task status:', err);
      },
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'عالي':
        return 'priority-high';
      case 'متوسط':
        return 'priority-medium';
      case 'عادي':
        return 'priority-normal';
      default:
        return 'priority-normal';
    }
  }

  isOverdue(): boolean {
    if (!this.task) return false;
    return (
      new Date() > new Date(this.task.deadline) &&
      this.task.status !== CustomTaskStatus.Completed
    );
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(this.task!);
    this.errorMessage = '';
    this.successMessage = '';
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

  saveTask() {
    if (this.editTaskForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.editTaskForm.value;

    const updatedTask: IUpdateTask = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      deadline: new Date(formValue.deadline),
      employeeId: formValue.employeeId,
      status: formValue.status,
      refrence: formValue.refrence,
    };

    this.taskService.update(this.task.id, updatedTask).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'تم تحديث المهمة بنجاح';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ في تحديث المهمة';
      },
    });
  }

  deleteTask() {
    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.errorMessage = 'حدث خطأ أثناء حذف المهمة';
      },
    });
  }
}
