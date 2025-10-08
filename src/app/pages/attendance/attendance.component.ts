import { Component, Input } from '@angular/core';
import {
  AttendanceRecord,
  AttendanceStatus,
  NewAttendanceRecord,
} from '../../model/attendance-record/attendance-record';
import { User } from '../../model/auth/user';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { LogService } from '../../services/logging/log.service';
import { map, Observable, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FingerPrientService } from '../../services/finger-prient/finger-prient.service';
import { AlertService } from '../../services/helper-services/alert.service';

@Component({
  selector: 'app-attendance',
  imports: [DatePipe],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  @Input() currentUser: User | null = null;
  currentTime = new Date();

  todayRecord: AttendanceRecord | null = null;
  isProcessing = false;

  alertMessage = '';
  attendanceErrorMessage = '';
  alertType = 'info';

  deviceID = '';
  ipAddress = '';

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private fp: FingerPrientService,
    private logger: LogService
  ) {}

  ngOnInit() {
    this.startTimeUpdate();
    setTimeout(() => {
      if (this.currentUser) {
        this.loadToadayAttendance(this.currentUser.id);
      }
    }, 3000);

    this.getFingerPrient();
    this.getIpAddress().subscribe((ip) => {
      this.ipAddress = ip;
      this.logger.log('info', 'Current IP Address: ', ip);
    });
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
        console.log(this.todayRecord)
        console.log(response);
        this.logger.log('Getting Today Attendance For Employee:', empId);
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
    return !this.todayRecord || !this.todayRecord.clockOut;
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
      employeeId: this.currentUser!.id,
      deviceId: this.deviceID,
      ipAddress: this.ipAddress,
    };

    this.attendanceService.checkIn(checkInData).subscribe({
      next: (response) => {
        this.todayRecord = response;
        this.logger.log(
          'info',
          'Sent Attendance Record and Got Response: ',
          response
        );
        this.showAlert('تم تسجيل الحضور بنجاح', 'success');
        this.isProcessing = false;
      },
      error: (error) => {
        this.logger.log(
          'error',
          'Sent Attendance Record and Got Error Response: ',
          error
        );
        this.showAlert(error.error, 'error');
        this.isProcessing = false;
      },
    });
  }

  onClockOut() {
    if (!this.currentUser?.id) {
      this.isProcessing = false;
      return;
    }

    this.attendanceService.clockOut(this.currentUser.id).subscribe({
      next: (response) => {
        this.todayRecord = response;
        console.log(response);
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
          this.logger.log(
            'debug',
            'Check In From Get Network IP Method with ip: ',
            data.ip
          );
          observer.next(data.ip);
          observer.complete();
        })
        .catch((error) => {
          this.logger.log('error', 'Error Getting IP Address');
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
}
