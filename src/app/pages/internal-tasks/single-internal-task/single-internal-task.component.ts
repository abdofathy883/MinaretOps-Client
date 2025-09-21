import { Component, OnInit } from '@angular/core';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateInternalTaskAssignment,
  InternalTask,
  InternalTaskType,
  UpdateInternalTask,
} from '../../../model/internal-task/internal-task';
import { CommonModule } from '@angular/common';
import { CustomTaskStatus } from '../../../model/task/task';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../model/auth/user';

@Component({
  selector: 'app-single-internal-task',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './single-internal-task.component.html',
  styleUrl: './single-internal-task.component.css',
})
export class SingleInternalTaskComponent implements OnInit {
  internalTask: InternalTask | null = null;
  updatingStatus = false;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  errorMessage = '';
  successMessage = '';
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isUserContentLeader: boolean = false;
  isUserDesignLeader: boolean = false;
  internalTaskForm!: FormGroup;
  employees: User[] = [];

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
    private internalTaskService: InternalTaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadEmployees();
    this.loadTask();
    this.checkUserPermissions();
  }
  private initializeForm(): void {
    this.internalTaskForm = this.fb.group({
      title: ['', Validators.required],
      taskType: ['', Validators.required],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      priority: ['', Validators.required],
      leader: ['', Validators.required],
      employees: [[]],
    });
  }

  private loadEmployees(): void {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      },
    });
  }

  private loadTask(): void {
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    const taskId = Number(taskIdParam);

    this.internalTaskService.getById(taskId).subscribe({
      next: (task) => {
        this.internalTask = task;
        console.log('Fetched task:', task);
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل بيانات المهمة';
        console.error('Error loading task:', error);
      },
    });
  }

  private checkUserPermissions(): void {
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

  toggleEditMode(): void {
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.populateForm();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // this.populateForm(this.task!);
    this.errorMessage = '';
    this.successMessage = '';
  }

  private populateForm(): void {
    if (!this.internalTask) return;

    // Find the leader from assignments
    const leaderAssignment = this.internalTask.assignments.find(
      (assignment) => assignment.isLeader
    );
    const leaderId = leaderAssignment ? leaderAssignment.employeeId : '';

    // Get all team member IDs
    const teamMemberIds = this.internalTask.assignments
      .filter((assignment) => !assignment.isLeader)
      .map((assignment) => assignment.employeeId);

    this.internalTaskForm.patchValue({
      title: this.internalTask.title,
      taskType: this.internalTask.taskType.toString(),
      description: this.internalTask.description,
      deadline: this.formatDateForInput(this.internalTask.deadline),
      priority: this.mapPriorityFromBackend(this.internalTask.priority),
      leader: leaderId,
      employees: teamMemberIds,
    });
  }

  updateTaskStatus(newStatus: CustomTaskStatus) {
    if (!this.internalTask) {
      return;
    }

    this.updatingStatus = true;

    this.internalTaskService
      .changeTaskStatus(this.internalTask.id, newStatus)
      .subscribe({
        next: () => {
          if (this.internalTask) {
            this.internalTask.status = newStatus;
            if (newStatus === CustomTaskStatus.Completed) {
              this.internalTask.completedAt = new Date();
            }
            this.updatingStatus = false;
          }
        },
        error: (err) => {
          this.updatingStatus = false;
          console.error('Error updating task status:', err);
        },
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
    if (!this.internalTask) return false;
    return (
      new Date() > new Date(this.internalTask.deadline) &&
      this.internalTask.status !== CustomTaskStatus.Completed
    );
  }

  onSubmit(): void {
    if (this.internalTaskForm.valid && this.internalTask) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.internalTaskForm.value;
      const assignments: CreateInternalTaskAssignment[] = [];

      // Add leader assignment
      assignments.push({
        userId: formValue.leader,
        isLeader: true,
      });

      // Add team members (excluding the leader to avoid duplication)
      if (formValue.employees && formValue.employees.length > 0) {
        const teamMembers = formValue.employees.filter(
          (empId: string) => empId !== formValue.leader
        );
        teamMembers.forEach((empId: string) => {
          assignments.push({
            userId: empId,
            isLeader: false,
          });
        });
      }

      // Prepare the update data
      const updateData: UpdateInternalTask = {
        title: formValue.title,
        taskType: this.mapTaskTypeToEnum(formValue.taskType),
        description: formValue.description,
        deadline: this.formatDateForBackend(formValue.deadline),
        priority: this.mapPriorityToBackend(formValue.priority),
        status: this.internalTask.status, // Keep current status
        assignments: assignments,
      };

      this.internalTaskService
        .update(this.internalTask.id, updateData)
        .subscribe({
          next: (updatedTask) => {
            this.internalTask = updatedTask;
            this.isEditMode = false;
            this.isLoading = false;
            this.successMessage = 'تم تحديث المهمة بنجاح';
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (error) => {
            this.isLoading = false;
            if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage =
                'فشل في تحديث المهمة. يرجى المحاولة مرة أخرى.';
            }
          },
        });
    } else {
      this.internalTaskForm.markAllAsTouched();
      this.errorMessage = 'يرجى ملء جميع الحقول المطلوبة';
    }
  }

  // Helper methods
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format for input
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  private mapPriorityToBackend(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      low: 'عادي',
      medium: 'مهم',
      high: 'مستعجل',
    };
    return priorityMap[priority] || 'عادي';
  }

  private mapPriorityFromBackend(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      عادي: 'low',
      مهم: 'medium',
      مستعجل: 'high',
    };
    return priorityMap[priority] || 'low';
  }

  private mapTaskTypeToEnum(taskTypeString: string): InternalTaskType {
    const taskTypeMap: { [key: string]: InternalTaskType } = {
      '0': InternalTaskType.HRMeeting,
      '1': InternalTaskType.ManagementMeeting,
      '2': InternalTaskType.PotentialClientMeeting,
      '3': InternalTaskType.ExistingClientMeeting,
      '4': InternalTaskType.ProjectManagementMeeting,
      '5': InternalTaskType.TasksAllocation,
      '6': InternalTaskType.TasksUpdate,
      '7': InternalTaskType.UpdatingReports,
      '8': InternalTaskType.UpdatingKPIs,
      '9': InternalTaskType.ProductionFollowUp,
      '10': InternalTaskType.PaymentsAndFinance,
      '11': InternalTaskType.ClientOnboarding,
      '12': InternalTaskType.ClientFollowUp,
      '13': InternalTaskType.Quotations,
      '14': InternalTaskType.MarketingOffer,
      '15': InternalTaskType.SalesTeamHandling,
      '16': InternalTaskType.Recruitment,
      '17': InternalTaskType.Subscriptions,
      '18': InternalTaskType.FinancialAdjustments,
      '19': InternalTaskType.ModifyTables,
      '20': InternalTaskType.Check,
    };
    return taskTypeMap[taskTypeString] || InternalTaskType.Check;
  }

  // Helper method to check if a field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.internalTaskForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  deleteTask(): void {
    if (!this.internalTask) return;
    this.internalTaskService.delete(this.internalTask.id).subscribe({
      next: () => {
        this.router.navigate(['/internal-tasks']);
      },
    });
  }
}
