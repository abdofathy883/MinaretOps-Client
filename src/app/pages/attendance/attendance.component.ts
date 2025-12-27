import { Component, Input } from '@angular/core';
import {
  AttendanceRecord,
  AttendanceStatus,
  BreakPeriod,
  NewAttendanceRecord,
} from '../../model/attendance-record/attendance-record';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FingerPrientService } from '../../services/finger-prient/finger-prient.service';
import { PushNotificationService } from '../../services/push-notification/push-notification.service';

@Component({
  selector: 'app-attendance',
  imports: [DatePipe],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  @Input() userId: string = '';
  currentTime = new Date();

  todayRecord: AttendanceRecord | null = null;
  isProcessing = false;

  alertMessage = '';
  attendanceErrorMessage = '';
  alertType = 'info';

  deviceID = '';
  ipAddress = '';

  activeBreak: BreakPeriod | null = null;
  isBreakProcessing = false;

  constructor(
    private attendanceService: AttendanceService,
    private fp: FingerPrientService,
    private pushNotificationService: PushNotificationService
  ) {}

  ngOnInit() {
    // this.pushNotificationService.subscribeToNotifications(this.userId).then((success) => {
    //   if (success) {
    //     this.showAlert('تم الاشتراك في الاشعارات', 'success');
    //   } else {
    //     this.showAlert('فشل الاشتراك في الاشعارات', 'error');
    //   }
    // });

    
    this.startTimeUpdate();
    this.loadToadayAttendance(this.userId);

    this.getFingerPrient();
    this.getIpAddress().subscribe((ip) => {
      this.ipAddress = ip;
    });

    // Load active break
    this.loadActiveBreak(this.userId);
  }

  async sendTestNotification() {
    if (!this.userId) {
      this.showAlert('User ID is missing', 'error');
      return;
    }

    const success = await this.pushNotificationService.sendTestNotification(this.userId);
    
    if (success) {
      this.showAlert('تم إرسال الإشعار', 'success');
    } else {
      this.showAlert('فشل إرسال الإشعار', 'error');
    }
  }

  calculateWorkDuration(clockIn: Date, clockOut: Date): string {
  const duration = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} ساعة و ${minutes} دقيقة`;
}

  async getFingerPrient() {
    this.deviceID = await this.fp.getOrCreateDeviceId();
  }

  getAttendanceStatusLabel(status: AttendanceStatus | null): string {
    switch (status) {
      case AttendanceStatus.Present:
        return 'حاضر';
      case AttendanceStatus.Absent:
        return 'غائب';
      case AttendanceStatus.Leave:
        return 'في إجازة';
      default:
        return 'غير محدد';
    }
  }

  loadToadayAttendance(empId: string) {
    this.attendanceService.getTodayAttendanceByEmployeeId(empId).subscribe({
      next: (response) => {
        this.todayRecord = response;
      },
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  // Determine if user can clock in (no record today or has clocked out)
  canClockIn(): boolean {
    return !this.todayRecord || !this.todayRecord.clockIn;
  }

  // Determine if user can clock out (has record today and hasn't clocked out)
  canClockOut(): boolean {
    return !!this.todayRecord && !!this.todayRecord.clockIn && !this.todayRecord.clockOut;
  }

  // Get button text based on current state
  getButtonText(): string {
    if (this.canClockIn()) {
      return 'تسجيل الحضور';
    } else if (this.canClockOut()) {
      return 'تسجيل الانصراف';
    }
    return 'تم التسجيل اليوم';
  }

  // Get button icon based on current state
  getButtonIcon(): string {
    if (this.canClockIn()) {
      return 'bi bi-calendar-plus ms-3';
    } else if (this.canClockOut()) {
      return 'bi bi-calendar-minus ms-3';
    }
    return 'bi bi-calendar-check ms-3';
  }

  // Unified method for clock in/out
  onAttendanceAction() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    if (this.canClockIn()) {
      this.onCheckIn();
    } else if (this.canClockOut()) {
      this.onClockOut();
    }
  }

  onCheckIn() {
    const checkInData: NewAttendanceRecord = {
      employeeId: this.userId,
      deviceId: this.deviceID,
      ipAddress: this.ipAddress,
    };



    this.attendanceService.checkIn(checkInData).subscribe({
      next: (response) => {
        this.todayRecord = response;
        this.showAlert('تم تسجيل الحضور بنجاح', 'success');
        this.isProcessing = false;
      },
      error: (error) => {
        this.showAlert(error.error, 'error');
        this.isProcessing = false;
      },
    });
  }

  onClockOut() {
    if (!this.userId) {
      this.isProcessing = false;
      return;
    }

    this.attendanceService.clockOut(this.userId).subscribe({
      next: (response) => {
        this.todayRecord = response;
        this.showAlert('تم تسجيل الانصراف', 'success');
        this.isProcessing = false;
      },
      error: (err) => {
        this.showAlert(err.error, 'error');
        this.isProcessing = false;
      }
    })
  }

  getIpAddress(): Observable<string> {
    return new Observable((observer) => {
      fetch('https://api.ipify.org?format=json')
        .then((response) => response.json())
        .then((data) => {
          observer.next(data.ip);
          observer.complete();
        })
        .catch((error) => {
          observer.next('127.0.0.1'); // Fallback
          observer.complete();
        });
    });
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

  loadActiveBreak(empId: string) {
    this.attendanceService.getActiveBreak(empId).subscribe({
      next: (response) => {
        this.activeBreak = response;
      },
      error: (error) => {
        this.activeBreak = null;
      }
    });
  }

  // Break-related methods
  canStartBreak(): boolean {
    return !!this.todayRecord && !!this.todayRecord.clockIn && !this.todayRecord.clockOut && !this.activeBreak;
  }

  canEndBreak(): boolean {
    return !!this.activeBreak;
  }

  getBreakButtonText(): string {
    if (this.canStartBreak()) {
      return 'بدء الاستراحة';
    } else if (this.canEndBreak()) {
      return 'إنهاء الاستراحة';
    }
    return 'لا يمكن بدء استراحة';
  }

  getBreakButtonIcon(): string {
    if (this.canStartBreak()) {
      return 'bi bi-pause-circle ms-3';
    } else if (this.canEndBreak()) {
      return 'bi bi-play-circle ms-3';
    }
    return 'bi bi-pause-circle ms-3';
  }

  onBreakAction() {
    if (this.isBreakProcessing) return;

    this.isBreakProcessing = true;

    if (this.canStartBreak()) {
      this.startBreak();
    } else if (this.canEndBreak()) {
      this.endBreak();
    }
  }

  startBreak() {
    if (!this.userId) {
      this.isBreakProcessing = false;
      return;
    }

    this.attendanceService.startBreak(this.userId).subscribe({
      next: (response) => {
        this.activeBreak = response;
        this.showAlert('تم بدء الاستراحة', 'success');
        this.isBreakProcessing = false;
      },
      error: (error) => {
        this.showAlert(error.error, 'error');
        this.isBreakProcessing = false;
      }
    });
  }

  endBreak() {
    if (!this.userId) {
      this.isBreakProcessing = false;
      return;
    }

    this.attendanceService.endBreak(this.userId).subscribe({
      next: (response) => {
        this.activeBreak = null;
        // Refresh today's attendance to get updated break periods
        this.loadToadayAttendance(this.userId);
        this.showAlert('تم إنهاء الاستراحة', 'success');
        this.isBreakProcessing = false;
      },
      error: (error) => {
        this.showAlert(error.error, 'error');
        this.isBreakProcessing = false;
      }
    });
  }

  calculateBreakDuration(startTime: Date, endTime: Date): string {
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة و ${minutes} دقيقة`;
  }

  formatBreakTime(date: Date): string {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
