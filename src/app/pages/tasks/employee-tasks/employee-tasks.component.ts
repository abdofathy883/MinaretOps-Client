import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { TaskService } from '../../../services/tasks/task.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CustomTaskStatus,
  LightWieghtClient,
  TaskDTO,
} from '../../../model/client/client';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-employee-tasks',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './employee-tasks.component.html',
  styleUrl: './employee-tasks.component.css',
})
export class EmployeeTasksComponent implements OnInit {
  clients: LightWieghtClient[] = [];
  tasks: TaskDTO[] = [];
  filteredTasks: TaskDTO[] = [];
  filterForm!: FormGroup;
  employeeId: string = '';

  constructor(
    private clientService: ClientService,
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      clientId: [null],
      priority: [null],
    });
  }

  ngOnInit(): void {
    this.employeeId = this.authService.getCurrentUserId();
    this.loadClients();
    this.loadTasks();
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response;
      },
    });
  }

  loadTasks() {
    this.taskService.getTasksByEmployee(this.employeeId).subscribe({
      next: (response) => {
        this.tasks = response.reverse();
        this.filteredTasks = [...this.tasks];
      },
    });
  }

  getStatusLabel(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open: return 'لم تبدأ';
      case CustomTaskStatus.Acknowledged: return 'تم الإقرار';
      case CustomTaskStatus.InProgress: return 'قيد التنفيذ';
      case CustomTaskStatus.UnderReview: return 'قيد المراجعة';
      case CustomTaskStatus.NeedsEdits: return 'تحتاج إلى تعديلات';
      case CustomTaskStatus.Completed: return 'مكتمل';
      default: return 'غير محدد';
    }
  }

  getStatusClass(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open: return 'status-not-started';
      case CustomTaskStatus.Acknowledged: return 'status-acknowledged';
      case CustomTaskStatus.InProgress: return 'status-in-progress';
      case CustomTaskStatus.UnderReview: return 'status-under-review';
      case CustomTaskStatus.NeedsEdits: return 'status-needs-edits';
      case CustomTaskStatus.Completed: return 'status-completed';
      default: return 'status-unknown';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'مستعجل': return 'priority-high';
      case 'مهم': return 'priority-medium';
      case 'عادي': return 'priority-normal';
      default: return 'priority-normal';
    }
  }
  
  applyFilters() {
    const formValues = this.filterForm.value;

    // Convert string IDs to numbers
    const clientId = formValues.clientId ? Number(formValues.clientId) : null;
    const priority = formValues.priority;

    this.filteredTasks = this.tasks.filter((task) => {
      let matches = true;

      // Filter by client ID
      if (clientId && task.clientId !== clientId) {
        matches = false;
      }

      // Filter by priority
      if (priority && task.priority !== priority) {
        matches = false;
      }

      return matches;
    });
  }

  goToTask(taskId: number) {
    this.router.navigate(['tasks', taskId]);
  }
}
