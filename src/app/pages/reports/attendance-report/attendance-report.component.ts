import { Component, OnInit } from '@angular/core';
import { ReportingService } from '../../../services/reporting/reporting.service';
import { AttendanceStatus } from '../../../model/attendance-record/attendance-record';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MonthlyAttendanceReport } from '../../../model/reporting/i-task-employee-report';

@Component({
  selector: 'app-attendance-report',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css'
})
export class AttendanceReportComponent implements OnInit {
  attendanceReport: MonthlyAttendanceReport | null = null;
  filterForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  attendanceStatuses = AttendanceStatus;

  constructor(
    private reportingService: ReportingService,
    private fb: FormBuilder
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

    // Convert status string to number if provided
    const status = formValue.status !== null && formValue.status !== '' 
      ? parseInt(formValue.status) 
      : null;

    this.reportingService.getMonthlyAttendanceReport(fromDate, toDate, status).subscribe({
      next: (report) => {
        this.attendanceReport = report;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'حدث خطأ أثناء تحميل التقرير';
        this.loading = false;
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
}