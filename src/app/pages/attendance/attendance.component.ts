import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AttendanceRecord, AttendanceStatus, NewAttendanceRecord } from '../../model/attendance-record/attendance-record';
import { User } from '../../model/auth/user';
import { AttendanceService } from '../../services/attendance/attendance.service';

@Component({
  selector: 'app-attendance',
  imports: [DatePipe],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent {
  @Input() currentUser: User | null = null;
  currentTime = new Date();

  todayRecord: AttendanceRecord | null = null;
  hasCheckedInToday = false;
  isCheckingIn = false;
  
  alertMessage = '';
  attendanceErrorMessage = '';
  alertType = 'info';

  constructor(private attendanceService: AttendanceService) {
    
  }
  
  ngOnInit() {
    this.startTimeUpdate();
    setTimeout(() => {
        if (this.currentUser) {
        this.loadToadayAttendance(this.currentUser.id);
      }
      }, 5000);
  }

  getAttendanceStatusLabel(status: AttendanceStatus | null): string {
    switch (status) {
      case AttendanceStatus.Present: return 'حاضر';
      case AttendanceStatus.Absent: return 'غائب';
      case AttendanceStatus.Leave: return 'في إجازة';
      default: return 'غير محدد';
    }
  }

  loadToadayAttendance(empId: string) {
    this.attendanceService.getTodayAttendanceByEmployeeId(empId).subscribe({
      next: (response) => {
        this.todayRecord = response;

      },
      error: (error) => {
        this.attendanceErrorMessage =
          error.message || 'حدث خطأ أثناء تحميل سجل الحضور';
      }
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  async onCheckIn() {
    if (this.hasCheckedInToday || this.isCheckingIn) return;

    this.isCheckingIn = true;
    
    // Get device info automatically
    const deviceId = await this.getDeviceId();
    const ipAddress = await this.getIpAddress();
    console.log('Device ID:', deviceId);
    console.log('IP Address:', ipAddress);

    const checkInData : NewAttendanceRecord = {
      employeeId: this.currentUser!.id,
      checkInTime: new Date(),
      deviceId: deviceId,
      ipAddress: ipAddress
    };

    this.attendanceService.checkIn(checkInData).subscribe({
      next: (response) => {
        this.hasCheckedInToday = true;
        this.todayRecord = response;
        console.log('Check-in successful:', response);
        this.showAlert('تم تسجيل الحضور بنجاح', 'success');
      },
      error: (error) => {
        this.showAlert('حدث خطأ أثناء تسجيل الحضور', 'error');
      }
    });
  }

  async getDeviceId(): Promise<string> {
    // Simple device fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = canvas.toDataURL();
    return btoa(fingerprint).substring(0, 16);
  }

  async getIpAddress(): Promise<string> {
    try {
      // TODO: Replace with actual IP detection service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '127.0.0.1'; // Fallback
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
}
