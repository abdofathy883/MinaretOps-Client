import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AttendanceDashboardService } from '../../../services/attendance/attendance-dashboard.service';
import { AttendanceDashboard, ActiveEmployee, Employee } from '../../../model/attendance-record/attendance-record';
import { TaskService } from '../../../services/tasks/task.service';
import { ITask, TaskFilter, CustomTaskStatus } from '../../../model/task/task';
import { AuthService } from '../../../services/auth/auth.service';

interface EmployeeWithTasks extends ActiveEmployee {
  tasks: ITask[];
  tasksLoading?: boolean;
  tasksLoaded?: boolean;
}

interface AbsentEmployeeWithTasks extends Employee {
  tasks: ITask[];
  tasksLoading?: boolean;
  tasksLoaded?: boolean;
}

@Component({
  selector: 'app-task-emp-report',
  imports: [CommonModule, DatePipe],
  templateUrl: './task-emp-report.component.html',
  styleUrl: './task-emp-report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskEmpReportComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  workingEmployees: EmployeeWithTasks[] = [];
  onBreakEmployees: EmployeeWithTasks[] = [];
  absentEmployees: AbsentEmployeeWithTasks[] = [];
  onLeaveEmployees: AbsentEmployeeWithTasks[] = [];
  
  expandedEmployees: Set<string> = new Set();
  
  private currentUserId: string = '';
  private today: string = '';

  constructor(
    private attendanceService: AttendanceDashboardService,
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.today = new Date().toISOString().split('T')[0];
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.attendanceService.getAttendanceDashboard().subscribe({
      next: (dashboard) => {
        // Initialize employee lists with empty tasks
        this.workingEmployees = dashboard.currentlyActiveEmployees
          .filter(emp => !emp.isOnBreak)
          .map(emp => ({ ...emp, tasks: [], tasksLoaded: false }));
        
        this.onBreakEmployees = dashboard.currentlyActiveEmployees
          .filter(emp => emp.isOnBreak)
          .map(emp => ({ ...emp, tasks: [], tasksLoaded: false }));

        this.absentEmployees = dashboard.absentEmployees
          .map(emp => ({ ...emp, tasks: [], tasksLoaded: false }));

        this.onLeaveEmployees = dashboard.onLeaveEmployees
          .map(emp => ({ ...emp, tasks: [], tasksLoaded: false }));

        this.loading = false;
      },
      error: (err) => {
        this.error = 'فشل تحميل لوحة التحكم';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleEmployee(employeeId: string): void {
    if (this.expandedEmployees.has(employeeId)) {
      this.expandedEmployees.delete(employeeId);
    } else {
      this.expandedEmployees.add(employeeId);
      this.loadEmployeeTasks(employeeId);
    }
  }

  isExpanded(employeeId: string): boolean {
    return this.expandedEmployees.has(employeeId);
  }

  loadEmployeeTasks(employeeId: string): void {
    // Find employee in all lists
    let employee = this.findEmployee(employeeId);
    if (!employee || employee.tasksLoaded || employee.tasksLoading) {
      return;
    }

    employee.tasksLoading = true;

    const filter: TaskFilter = {
      employeeId: employeeId,
      fromDate: this.today,
      toDate: this.today,
      pageNumber: 1,
      pageSize: 1000 // Large page size to get all tasks for today
    };

    this.taskService.getPaginatedTasks(filter, this.currentUserId).subscribe({
      next: (result) => {
        // Filter tasks by deadline (show tasks with deadline today or not yet passed)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        employee!.tasks = result.records.filter(task => {
          const deadline = new Date(task.deadline);
          deadline.setHours(0, 0, 0, 0);
          // Show tasks that are not completed or deadline hasn't passed
          return task.status !== CustomTaskStatus.Completed || deadline >= today;
        });
        
        employee!.tasksLoading = false;
        employee!.tasksLoaded = true;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        employee!.tasksLoading = false;
        employee!.tasks = [];
      }
    });
  }

  private findEmployee(employeeId: string): EmployeeWithTasks | AbsentEmployeeWithTasks | undefined {
    return this.workingEmployees.find(e => e.employeeId === employeeId) ||
           this.onBreakEmployees.find(e => e.employeeId === employeeId) ||
           this.absentEmployees.find(e => e.employeeId === employeeId) ||
           this.onLeaveEmployees.find(e => e.employeeId === employeeId);
  }

  getStatusClass(isOnBreak?: boolean): string {
    if (isOnBreak === true) return 'status-break';
    if (isOnBreak === false) return 'status-working';
    return 'status-absent';
  }

  getStatusText(isOnBreak?: boolean): string {
    if (isOnBreak === true) return 'في استراحة';
    if (isOnBreak === false) return 'يعمل';
    return 'غائب';
  }

  getTaskStatusClass(status: CustomTaskStatus): string {
    const statusClasses: { [key: number]: string } = {
      [CustomTaskStatus.Open]: 'badge bg-secondary',
      [CustomTaskStatus.Acknowledged]: 'badge bg-info',
      [CustomTaskStatus.InProgress]: 'badge bg-primary',
      [CustomTaskStatus.UnderReview]: 'badge bg-warning',
      [CustomTaskStatus.NeedsEdits]: 'badge bg-danger',
      [CustomTaskStatus.Completed]: 'badge bg-success'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  getTaskStatusText(status: CustomTaskStatus): string {
    const statusTexts: { [key: number]: string } = {
      [CustomTaskStatus.Open]: 'مفتوح',
      [CustomTaskStatus.Acknowledged]: 'معترف به',
      [CustomTaskStatus.InProgress]: 'قيد التنفيذ',
      [CustomTaskStatus.UnderReview]: 'قيد المراجعة',
      [CustomTaskStatus.NeedsEdits]: 'يحتاج تعديلات',
      [CustomTaskStatus.Completed]: 'مكتمل'
    };
    return statusTexts[status] || 'غير محدد';
  }

  formatDeadline(deadline: Date): string {
    return new DatePipe('en-US').transform(deadline, 'short') || '';
  }

  isDeadlinePassed(deadline: Date, status: CustomTaskStatus): boolean {
    if (status === CustomTaskStatus.Completed) return false;
    const now = new Date();
    return new Date(deadline) < now;
  }

  trackByEmployeeId(index: number, employee: EmployeeWithTasks | AbsentEmployeeWithTasks): string {
    return employee.employeeId;
  }

  trackByTaskId(index: number, task: ITask): number {
    return task.id;
  }

  shortTimeSpan(duration?: string): string {
    if (!duration) return '';
    return duration.split('.')[0].substring(0, 5);
  }
}
