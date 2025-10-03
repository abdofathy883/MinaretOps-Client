import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  CustomTaskStatus,
  ICreateTaskResources,
  ITask,
  IUpdateTask,
  TaskType,
} from '../../../model/task/task';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../model/auth/user';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { AlertService } from '../../../services/helper-services/alert.service';
import { hasError } from '../../../services/helper-services/utils';

@Component({
  selector: 'app-single-task',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MapTaskStatusPipe,
    MapTaskStatusClassPipe,
  ],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.css',
})
export class SingleTaskComponent implements OnInit {
  task!: ITask;
  updatingStatus = false;
  isEditMode: boolean = false;
  alertMessage = '';
  alertType = 'info';
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isUserContentLeader: boolean = false;
  isUserDesignLeader: boolean = false;
  editTaskForm!: FormGroup;
  employees: User[] = [];
  currentUserId: string = '';
  isLoading: boolean = false;
  isArchiveLoading: boolean = false;

  completeTaskForm!: FormGroup;
  isCompletingTask: boolean = false;

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
    // {
    //   value: CustomTaskStatus.Completed,
    //   label: 'مكتمل',
    //   icon: 'bi bi-rocket-takeoff-fill',
    // },
  ];
  CustomTaskStatus = CustomTaskStatus;
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private alertService: AlertService,
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

    // Initialize complete task form
    this.completeTaskForm = this.fb.group({
      urls: this.fb.array([]),
      completionNotes: ['']
    });
    // this.completeTaskForm = this.fb.group({
    //   urls: this.fb.array([
    //     this.fb.group({
    //       url: ['', Validators.required]
    //     })
    //   ]),
    //   completionNotes: ['']
    // });
  }

  ngOnInit(): void {
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    const taskId = Number(taskIdParam);
    this.taskService.getById(taskId).subscribe({
      next: (response) => {
        this.task = response;
        console.log(response)
      },
    });

    this.loadUser();
  }

  get urlControls() {
    return this.completeTaskForm.get('urls') as FormArray;
  }

  addUrl() {
    const urlGroup = this.fb.group({
      url: [null, Validators.required]
    });
    this.urlControls.push(urlGroup);
  }

  

  openCompleteTaskModal() {
    // Reset form
    // this.completeTaskForm.reset();
    // this.urlControls.clear();
    // this.addUrl(); // Add at least one URL field

    // Clear the form array completely
  while (this.urlControls.length !== 0) {
    this.urlControls.removeAt(0);
  }
  
  // Add fresh URL field
  this.addUrl();
  
  // Reset completion notes
  this.completeTaskForm.patchValue({
    completionNotes: ''
  });

  // Mark form as pristine and untouched
  this.completeTaskForm.markAsPristine();
  this.completeTaskForm.markAsUntouched();
    
    // Show modal using Bootstrap
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
      deadline: this.formatDateTimeForInput(task.deadline),
      employeeId: task.employeeId || '',
      status: task.status,
      refrence: task.refrence || '',
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

  updateTaskStatus(newStatus: CustomTaskStatus): void {
    if (!this.task) return;

    this.updatingStatus = true;

    this.taskService.changeStatus(this.task.id, this.currentUserId, newStatus).subscribe({
      next: () => {
        if (this.task) {
          this.task.status = newStatus;

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
      error: () => {
        this.updatingStatus = false;
        this.showAlert('فشل تحديث حالة التاسك', 'error');
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

    return 'قيمة غير صحيحة';
  }

  saveTask() {
    if (this.editTaskForm.invalid) return;

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
    };
    this.isLoading = false;

    this.taskService.update(this.task.id, this.currentUserId, updatedTask).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.task = response;
        this.showAlert('تم تحديث التاسك بنجاح', 'success');
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('فشل تحديث التاسك', 'error');
      },
    });
  }

  deleteTask() {
    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.showAlert('فشل حذف التاسك', 'error');
      },
    });
  }

  archiveTask() {
    this.isArchiveLoading = true;
    this.taskService.archive(this.task.id).subscribe({
      next: (res) => {
        this.isArchiveLoading = false;
        this.task = res;
        this.showAlert('تم أرشفة المهمة بنجاح', 'success');
      },
      error: () => {
        this.isArchiveLoading = false;
        this.showAlert('فشل ارشفة التاسك', 'error');
      }
    });
  }

  completeTask() {
    if (this.completeTaskForm.invalid) {
      this.completeTaskForm.markAllAsTouched();

    this.urlControls.controls.forEach(control => {
      control.get('url')?.markAsTouched();
    });

      this.showAlert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
      return;
    }

    this.isCompletingTask = true;
    
    const formValue = this.completeTaskForm.value;
    const urls = formValue.urls.map((urlGroup: any) => urlGroup.url)
    .filter((url: string) => url && url.trim() !== '');
    
    const taskResources: ICreateTaskResources = {
      taskId: this.task.id,
      urls: urls,
      completionNotes: formValue.completionNotes || undefined
    };
    this.taskService.complete(this.task.id, this.currentUserId, taskResources).subscribe({
      next: (response) => {
        this.isCompletingTask = false;
        this.task = response;
        this.showAlert('تم إكمال التاسك بنجاح', 'success');
        
        // Hide modal
        const modalElement = document.getElementById('completeTaskModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      },
      error: (err) => {
        this.isCompletingTask = false;
        this.showAlert('فشل إكمال التاسك', 'error');
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
}
