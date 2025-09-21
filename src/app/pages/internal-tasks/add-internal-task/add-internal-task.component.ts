import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { User } from '../../../model/auth/user';
import { CreateInternalTask, CreateInternalTaskAssignment, InternalTaskType } from '../../../model/internal-task/internal-task';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-internal-task',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './add-internal-task.component.html',
  styleUrl: './add-internal-task.component.css'
})
export class AddInternalTaskComponent implements OnInit{
  isLoading: boolean = false;
  errorMessage: string = '';
  internalTaskForm!: FormGroup;
  employees: User[] = [];

  alertMessage = '';
  alertType = 'info';

  constructor(
    private authService: AuthService,
    private internalTaskService: InternalTaskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل قائمة الموظفين';
      }
    });

    this.internalTaskForm = this.fb.group({
      title: ['', Validators.required],
      taskType: ['', Validators.required],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      priority: ['', Validators.required],
      leader: ['', Validators.required],
      employees: [[]]
    });
  }

  onSubmit() {
    if (this.internalTaskForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.alertMessage = '';

      const formValue = this.internalTaskForm.value;
      const assignments: CreateInternalTaskAssignment[] = [];
      
      // Add leader assignment
      assignments.push({
        userId: formValue.leader,
        isLeader: true
      });

      // Add team members (excluding the leader to avoid duplication)
      if (formValue.employees && formValue.employees.length > 0) {
        const teamMembers = formValue.employees.filter((empId: string) => empId !== formValue.leader);
        teamMembers.forEach((empId: string) => {
          assignments.push({
            userId: empId,
            isLeader: false
          });
        });
      }

      // Prepare the data according to CreateInternalTaskDTO structure
      const taskData: CreateInternalTask = {
        title: formValue.title,
        taskType: this.mapTaskTypeToEnum(formValue.taskType),
        description: formValue.description,
        deadline: this.formatDateForBackend(formValue.deadline),
        priority: this.mapPriorityToBackend(formValue.priority),
        assignments: assignments
      };

      this.internalTaskService.add(taskData).subscribe({
        next: (response) => {
          this.showAlert('تم إنشاء التاسك بنجاح', 'success');
          this.isLoading = false;
          this.internalTaskForm.reset();
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.showAlert('فشل في إنشاء التاسك. يرجى المحاولة مرة أخرى.', 'error');
          }
        }
      });
    } else {
      this.internalTaskForm.markAllAsTouched();
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

  resetForm() {
    this.internalTaskForm.reset();
    this.errorMessage = '';
    this.alertMessage = '';
  }

  // Helper method to format date for backend (DateOnly)
  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  // Helper method to map priority values to backend format
  private mapPriorityToBackend(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'عادي',
      'medium': 'مهم',
      'high': 'مستعجل'
    };
    return priorityMap[priority] || 'عادي';
  }

  // Helper method to map task type string to enum
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
      '20': InternalTaskType.Check
    };
    return taskTypeMap[taskTypeString] || InternalTaskType.Check;
  }
  
  // Helper method to check if a field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.internalTaskForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  
}
