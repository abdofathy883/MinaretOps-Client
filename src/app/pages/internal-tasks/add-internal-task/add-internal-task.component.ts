import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { User } from '../../../model/auth/user';
import { CreateInternalTask, CreateInternalTaskAssignment } from '../../../model/internal-task/internal-task';
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
  successMessage: string = '';
  internalTaskForm!: FormGroup;
  employees: User[] = [];

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
        console.error('Error loading employees:', error);
      }
    });

    this.internalTaskForm = this.fb.group({
      title: ['', Validators.required],
      taskType: ['', Validators.required],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      priority: ['', Validators.required],
      leader: ['', Validators.required],
      employees: [[], Validators.required]
    });
  }

  onSubmit() {
    if (this.internalTaskForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.internalTaskForm.value;
      const assignments: CreateInternalTaskAssignment[] = [];
      
      // Add leader assignment
      assignments.push({
        userId: formValue.leader,
        isLeader: true
      });
      
      // Add team members (excluding the leader to avoid duplication)
      const teamMembers = formValue.employees.filter((empId: string) => empId !== formValue.leader);
      teamMembers.forEach((empId: string) => {
        assignments.push({
          userId: empId,
          isLeader: false
        });
      });

      // Prepare the data according to CreateInternalTaskDTO structure
      const taskData: CreateInternalTask = {
        title: formValue.title,
        taskType: formValue.taskType,
        description: formValue.description,
        deadline: this.formatDateForBackend(formValue.deadline),
        priority: this.mapPriorityToBackend(formValue.priority),
        assignments: assignments
      };

      this.internalTaskService.add(taskData).subscribe({
        next: (response) => {
          this.successMessage = 'تم إنشاء التاسك بنجاح';
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'فشل في إنشاء التاسك. يرجى المحاولة مرة أخرى.';
          }
        }
      });
    } else {
      this.internalTaskForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.internalTaskForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
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

  // Helper method to check if a field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.internalTaskForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
