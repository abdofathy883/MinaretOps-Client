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
  isCheckingIn = false;

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
        this.logger.log('Getting Today Attendance For Employee:', empId);
      },
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  onCheckIn() {
    this.isCheckingIn = true;

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
        this.isCheckingIn = false;
      },
      error: (error) => {
        this.logger.log(
          'error',
          'Sent Attendance Record and Got Error Response: ',
          error
        );
        this.showAlert('حدث خطأ أثناء تسجيل الحضور', 'error');
        this.isCheckingIn = false;
      },
    });
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
