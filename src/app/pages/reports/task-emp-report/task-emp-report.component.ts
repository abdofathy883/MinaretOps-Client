import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { TaskService } from '../../../services/tasks/task.service';
import { CustomTaskStatus, ILightWieghtTask } from '../../../model/task/task';
import { AuthService } from '../../../services/auth/auth.service';
import { EmployeeWithTasks } from '../../../model/reporting/i-task-employee-report';
import { ReportingService } from '../../../services/reporting/reporting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-emp-report',
  imports: [CommonModule],
  templateUrl: './task-emp-report.component.html',
  styleUrl: './task-emp-report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskEmpReportComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  workingEmployees: EmployeeWithTasks[] = [];
  onBreakEmployees: EmployeeWithTasks[] = [];
  absentEmployees: EmployeeWithTasks[] = [];
  
  expandedEmployees: Set<string> = new Set();
  
  private currentUserId: string = '';

  constructor(
    private reportingService: ReportingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck(); // Trigger change detection for loading state

    this.reportingService.getTaskEmployeeReport(this.currentUserId).subscribe({
      next: (report) => {
        this.workingEmployees = report.workingEmployees;
        this.onBreakEmployees = report.onBreakEmployees;
        this.absentEmployees = report.absentEmployees;
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection after data is loaded
      },
      error: (err) => {
        this.error = 'فشل تحميل التقرير';
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection on error
        console.error(err);
      }
    });
  }

  toggleEmployee(employeeId: string): void {
    if (this.expandedEmployees.has(employeeId)) {
      this.expandedEmployees.delete(employeeId);
    } else {
      this.expandedEmployees.add(employeeId);
    }
    this.cdr.markForCheck(); // Trigger change detection for toggle
  }

  isExpanded(employeeId: string): boolean {
    return this.expandedEmployees.has(employeeId);
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

  trackByEmployeeId(index: number, employee: EmployeeWithTasks): string {
    return employee.employeeId;
  }

  trackByTaskId(index: number, task: ILightWieghtTask): number {
    return task.id;
  }

  shortTimeSpan(duration?: string): string {
    if (!duration) return '';
    // Handle TimeSpan format like "HH:mm:ss" or "HH:mm:ss.fffffff"
    return duration.split('.')[0].substring(0, 5);
  }

  goToTask(id: number) {
    this.router.navigate(['tasks', id]);
  }
}