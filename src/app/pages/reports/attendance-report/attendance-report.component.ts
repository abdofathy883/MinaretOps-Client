import { Component, OnInit } from '@angular/core';
import { AttendanceDashboard} from '../../../model/attendance-record/attendance-record';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceDashboardService } from '../../../services/attendance/attendance-dashboard.service';

@Component({
  selector: 'app-attendance-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css'
})
export class AttendanceReportComponent implements OnInit {
  dashboardData!: AttendanceDashboard;
  loading: boolean = false;
  error: string | null = null;

  constructor(private attendanceService: AttendanceDashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
    // Auto-refresh every 30 seconds
    // setInterval(() => {
    //   this.loadDashboard();
    // }, 30000);
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    
    this.attendanceService.getAttendanceDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load attendance dashboard';
        this.loading = false;
        console.error(err);
      }
    });
  }

  formatDuration(duration?: string): string {
    if (!duration) return '';
    // Format the duration string if needed
    return duration;
  }

  getStatusClass(isOnBreak: boolean): string {
    return isOnBreak ? 'status-break' : 'status-active';
  }

  shortTimeSpan(timespan?: string): string {
    if (timespan) {
      return timespan.split('.')[0].substring(0, 5);
    } else {
      return '00:00';
    }
  }
}