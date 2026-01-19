import { MapTaskPriorityPipe } from './../../../core/pipes/task-priority/map-task-priority.pipe';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  CustomTaskStatus,
  ICreateTaskComment,
  ICreateTaskResources,
  ITask,
  ITaskComment,
  IUpdateTask,
  TaskType,
} from '../../../model/task/task';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../model/auth/user';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { AlertService } from '../../../services/helper-services/alert.service';
import { hasError } from '../../../services/helper-services/utils';
import { MapTaskTypePipe } from '../../../core/pipes/task-type/map-task-type.pipe';
import { TaskShimmerComponent } from '../../../shared/task-shimmer/task-shimmer.component';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-single-task',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MapTaskStatusPipe,
    MapTaskStatusClassPipe,
    MapTaskPriorityPipe,
    MapTaskTypePipe,
    TaskShimmerComponent,
    FormsModule,
    NgxEditorComponent,
    NgxEditorMenuComponent
  ],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.css',
})
export class SingleTaskComponent implements OnInit, OnDestroy {
  task!: ITask;
  updatingStatus = false;
  isEditMode: boolean = false;
  alertMessage = '';
  alertType = 'info';
  editTaskForm!: FormGroup;
  employees: User[] = [];
  currentUserId: string = '';
  isLoading: boolean = false;
  isArchiveLoading: boolean = false;
  isDeletingLoading: boolean = false;
  isLoadingTask: boolean = false;
  isTaskArchived: boolean = false; // Add this property to track archive status

  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isUserContentLeader: boolean = false;
  isUserDesignLeader: boolean = false;

  completeTaskForm!: FormGroup;
  isCompletingTask: boolean = false;

  newComment: string = '';
  isSubmittingComment: boolean = false;

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
      value: CustomTaskStatus.Rejected,
      label: 'مرفوضة',
      icon: 'bi bi-x-circle-fill',
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
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      taskType: ['', Validators.required],
      description: ['', Validators.maxLength(5000)],
      priority: ['', Validators.required],
      deadline: ['', Validators.required],
      employeeId: ['', Validators.required],
      status: ['', Validators.required],
      refrence: ['', Validators.maxLength(1000)],
      numberOfSubTasks: [''],
    });

    // Initialize complete task form
    this.completeTaskForm = this.fb.group({
      urls: this.fb.array([]),
      completionNotes: [''],
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.isLoadingTask = true;
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    const isArchivedParam = this.route.snapshot.queryParamMap.get('isArchived'); // Changed from queryParamMap to paramMap
    const taskId = Number(taskIdParam);
    const isArchived = isArchivedParam === 'true';

    // Use the unified endpoint instead of separate calls
    this.loadTaskUnified(taskId, isArchived);
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private loadTaskUnified(taskId: number, isArchived?: boolean): void {
    this.taskService.getTaskUnified(taskId, isArchived).subscribe({
      next: (response) => {
        this.isLoadingTask = false;
        this.task = response;
        this.isTaskArchived = isArchived === true;
      },
      error: (error) => {
        this.isLoadingTask = false;
        const errorMessage = isArchived
          ? 'لم يتم العثور على التاسك المؤرشف'
          : 'لم يتم العثور على التاسك';
        this.showAlert(errorMessage, 'error');
      },
    });
  }

  get urlControls() {
    return this.completeTaskForm.get('urls') as FormArray;
  }

  addUrl() {
    const urlGroup = this.fb.group({
      url: [null, Validators.required],
    });
    this.urlControls.push(urlGroup);
  }

  openCompleteTaskModal() {
    while (this.urlControls.length !== 0) {
      this.urlControls.removeAt(0);
    }

    this.addUrl();

    this.completeTaskForm.patchValue({
      completionNotes: '',
    });

    this.completeTaskForm.markAsPristine();
    this.completeTaskForm.markAsUntouched();

    const modalElement = document.getElementById('completeTaskModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  removeUrl(index: number) {
    if (this.urlControls.length > 1) {
      this.urlControls.removeAt(index);
    }
  }

  loadUser() {
    this.currentUserId = this.authService.getCurrentUserId();

    this.authService.getAll().subscribe((response) => {
      this.employees = response;
    });

    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) {
        this.isUserAdmin = true;
      }
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) {
        this.isUserAccountManager = true;
      }
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
      deadline: this.formatDateTimeForInput(task.deadline),
      employeeId: task.employeeId || '',
      status: task.status,
      refrence: task.refrence || '',
      numberOfSubTasks: task.numberOfSubTasks || '',
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

  updateTaskStatus(newStatus: CustomTaskStatus): void {
    if (!this.task) return;
    this.updatingStatus = true;
    console.log('Updating status to:', newStatus);
    console.log('Current Task ID:', this.task.id);
    console.log('Current User ID:', this.currentUserId);
    this.taskService
      .changeStatus(this.task.id, this.currentUserId, newStatus)
      .subscribe({
        next: (response) => {
          if (this.task) {
            this.task.status = newStatus;
            console.log('Updated Status:', response);
            // Update CompletedAt field
            if (newStatus === CustomTaskStatus.Completed) {
              this.task.completedAt = new Date();
            } else {
              this.task.completedAt = undefined;
            }
            this.showAlert('تم تحديث حالة التاسك', 'success');
          }
          this.updatingStatus = false;
        },
        error: (error) => {
          this.updatingStatus = false;
          console.error('Error updating status:', error);
          this.showAlert(error.error, 'error');
        },
      });
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
    this.populateForm(this.task!);
  }

  cancelEdit(): void {
    this.isEditMode = false;
  }

  hasError(controlName: string): boolean {
    return hasError(this.editTaskForm, controlName);
  }

  getErrorMessage(controlName: string): string {
    const control = this.editTaskForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength']) {
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    }
    if (control.errors['maxlength']) {
      return `يجب ان يكون ${control.errors['maxlength'].requiredLength} أحرف على الاكثر`;
    }

    return 'قيمة غير صحيحة';
  }

  saveTask() {
    if (this.editTaskForm.invalid) {
      this.editTaskForm.markAllAsTouched();
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
      status: Number(formValue.status),
      refrence: formValue.refrence,
      numberOfSubTasks: formValue.numberOfSubTasks,
    };
    this.isLoading = true;

    this.taskService
      .update(this.task.id, this.currentUserId, updatedTask)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.task = response;
          this.showAlert('تم تحديث التاسك بنجاح', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.showAlert(error.error, 'error');
        },
      });
  }

  deleteTask() {
    this.isDeletingLoading = true;
    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.isDeletingLoading = false;
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.isDeletingLoading = false;
        this.showAlert(error.error, 'error');
      },
    });
  }

  archiveTask() {
    this.isArchiveLoading = true;
    this.taskService.archive(this.task.id).subscribe({
      next: (res) => {
        this.isArchiveLoading = false;
        this.task = res;
        this.isTaskArchived = true;
        this.showAlert('تم أرشفة المهمة بنجاح', 'success');
        this.router.navigate(['/tasks', res.id], {
          queryParams: { isArchived: true },
        });
      },
      error: (error) => {
        this.isArchiveLoading = false;
        this.showAlert(error.error, 'error');
      },
    });
  }

  restoreTask() {
    this.isArchiveLoading = true;
    this.taskService.restore(this.task.id).subscribe({
      next: (res) => {
        this.isArchiveLoading = false;
        this.task = res;
        this.isTaskArchived = false;
        this.showAlert('تم إلغاء أرشفة المهمة بنجاح', 'success');
        this.router.navigate(['/tasks', res.id]); // Updated to use route segments
      },
      error: (error) => {
        this.isArchiveLoading = false;
        this.showAlert(error.error, 'error');
      },
    });
  }

  completeTask() {
    if (this.completeTaskForm.invalid) {
      this.completeTaskForm.markAllAsTouched();

      this.urlControls.controls.forEach((control) => {
        control.get('url')?.markAsTouched();
      });

      this.showAlert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
      return;
    }

    this.isCompletingTask = true;

    const formValue = this.completeTaskForm.value;
    const urls = formValue.urls
      .map((urlGroup: any) => urlGroup.url)
      .filter((url: string) => url && url.trim() !== '');

    const taskResources: ICreateTaskResources = {
      taskId: this.task.id,
      urls: urls,
      completionNotes: formValue.completionNotes || undefined,
    };
    this.taskService
      .complete(this.task.id, this.currentUserId, taskResources)
      .subscribe({
        next: (response) => {
          this.isCompletingTask = false;
          this.task = response;
          this.showAlert('تم إكمال التاسك بنجاح', 'success');

          // Hide modal
          const modalElement = document.getElementById('completeTaskModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            if (modal) {
              modal.hide();
            }
          }
        },
        error: (err) => {
          this.isCompletingTask = false;
          this.showAlert(err.error, 'error');
        },
      });
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

  getDeadlineStatusText(): string {
    if (!this.task) return '';

    if (this.task.completedAt) {
      return this.task.isCompletedOnDeadline ? 'نعم' : 'لا';
    }

    if (new Date() < new Date(this.task.deadline)) {
      return 'لم يحن الموعد';
    }

    return 'لا';
  }

  getDeadlineStatusClass(): string {
    if (!this.task) return '';

    // If task is completed
    if (this.task.completedAt) {
      return this.task.isCompletedOnDeadline ? 'on-time' : 'late';
    }

    // If task is not completed but deadline hasn't arrived yet
    if (new Date() < new Date(this.task.deadline)) {
      return 'not-yet';
    }

    // If task is not completed and deadline has passed
    return 'late';
  }

  getDeadlineStatusIcon(): string {
    if (!this.task) return '';

    // If task is completed
    if (this.task.completedAt) {
      return this.task.isCompletedOnDeadline
        ? 'bi bi-check-circle'
        : 'bi bi-x-circle';
    }

    // If task is not completed but deadline hasn't arrived yet
    if (new Date() < new Date(this.task.deadline)) {
      return 'bi bi-clock';
    }

    // If task is not completed and deadline has passed
    return 'bi bi-x-circle';
  }

  addComment() {
    if (!this.newComment || this.newComment.trim() === '') {
      return;
    }

    this.isSubmittingComment = true;

    const commentData: ICreateTaskComment = {
      taskId: this.task.id,
      employeeId: this.currentUserId,
      comment: this.newComment.trim(),
    };

    this.taskService.addComment(commentData).subscribe({
      next: (response) => {
        // Add the new comment to the task's comments array
        if (!this.task.taskComments) {
          this.task.taskComments = [];
        }

        // Map the response to match ITaskComment interface
        const newComment: ITaskComment = {
          employeeId: response.employeeId,
          employeeName: response.employeeName || 'غير معروف',
          comment: response.comment,
          taskId: response.taskId,
          createdAt: response.createdAt,
        };

        this.task.taskComments.push(newComment);
        this.newComment = '';
        this.isSubmittingComment = false;
        this.showAlert('تم إضافة التعليق بنجاح', 'success');
      },
      error: (error) => {
        this.isSubmittingComment = false;
        this.showAlert(error.error || 'حدث خطأ أثناء إضافة التعليق', 'error');
      },
    });
  }
}
