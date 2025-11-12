import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReportingService } from '../../../services/reporting/reporting.service';
import { AttendanceStatus } from '../../../model/attendance-record/attendance-record';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MonthlyAttendanceReport } from '../../../model/reporting/i-task-employee-report';
import { MapKpiAspectPipe } from '../../../core/pipes/kpis/map-kpi-aspect.pipe';

@Component({
  selector: 'app-attendance-report',
  imports: [ReactiveFormsModule, CommonModule, MapKpiAspectPipe],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceReportComponent implements OnInit {
  attendanceReport: MonthlyAttendanceReport | null = null;
  filterForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  attendanceStatuses = AttendanceStatus;
  expandedEmployees: Set<string> = new Set();

  constructor(
    private reportingService: ReportingService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize form with current month's first and last day
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.filterForm = this.fb.group({
      fromDate: [firstDay.toISOString().split('T')[0]],
      toDate: [lastDay.toISOString().split('T')[0]],
      status: [null] // null means all statuses
    });

    // Load initial report
    this.loadReport();
  }

  loadReport(): void {
    const formValue = this.filterForm.value;
    
    if (!formValue.fromDate || !formValue.toDate) {
      this.error = 'يرجى تحديد تاريخ البداية والنهاية';
      return;
    }

    const fromDate = new Date(formValue.fromDate);
    const toDate = new Date(formValue.toDate);

    if (fromDate > toDate) {
      this.error = 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية';
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    // Convert status string to number if provided
    const status = formValue.status !== null && formValue.status !== '' 
      ? parseInt(formValue.status) 
      : null;

    this.reportingService.getMonthlyAttendanceReport(fromDate, toDate, status).subscribe({
      next: (report) => {
        this.attendanceReport = report;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'حدث خطأ أثناء تحميل التقرير';
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Error loading report:', err);
      }
    });
  }

  onSubmit(): void {
    this.loadReport();
  }

  formatHours(hours: number): string {
    return hours.toFixed(2);
  }

  getStatusLabel(status: AttendanceStatus): string {
    switch(status) {
      case AttendanceStatus.Present:
        return 'حاضر';
      case AttendanceStatus.Absent:
        return 'غياب';
      case AttendanceStatus.Leave:
        return 'إجازة';
      default:
        return '';
    }
  }

  toggleEmployee(employeeId: string): void {
    if (this.expandedEmployees.has(employeeId)) {
      this.expandedEmployees.delete(employeeId);
    } else {
      this.expandedEmployees.add(employeeId);
    }
    this.cdr.markForCheck();
  }

  isExpanded(employeeId: string): boolean {
    return this.expandedEmployees.has(employeeId);
  }

  trackByEmployeeId(index: number, employee: any): string {
    return employee.employeeId;
  }

  trackByIncident(index: number, incident: any): number {
    return index;
  }

  formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'short') || '';
  }
}