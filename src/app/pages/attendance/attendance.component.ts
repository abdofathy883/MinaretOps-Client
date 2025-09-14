import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AttendanceRecord, AttendanceStatus, NewAttendanceRecord } from '../../model/attendance-record/attendance-record';
import { User } from '../../model/auth/user';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { LogService } from '../../services/logging/log.service';
import { map, Observable, switchMap } from 'rxjs';

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
  isCheckingIn = false;
  
  alertMessage = '';
  attendanceErrorMessage = '';
  alertType = 'info';

  constructor(
    private attendanceService: AttendanceService,
    private logger: LogService
  ) { }
  
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
        this.logger.log('Getting Today Attendance For Employee:', empId);
      },
      // error: (error) => {
      //   this.attendanceErrorMessage =
      //     error.message || 'حدث خطأ أثناء تحميل سجل الحضور';
      // }
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  // async onCheckIn() {
  //   this.isCheckingIn = true;
    
  //   try {
  //     // Get device info automatically
  //     const deviceId = await this.getDeviceId();
  //     const ipAddress = await this.getIpAddress();
  //     this.logger.log('debug', 'Getting Device ID and Network IP: ', { deviceId, ipAddress })

      
  
  //     const checkInData : NewAttendanceRecord = {
  //       employeeId: this.currentUser!.id,
  //       deviceId: deviceId,
  //       ipAddress: ipAddress
  //     };
  
  //     this.logger.log('debug', 'New Attendance Record: ', checkInData);
      
  //     this.attendanceService.checkIn(checkInData).subscribe({
  //       next: (response) => {
  //         this.todayRecord = response;
  //         this.isCheckingIn = false;
  //         this.logger.log('info', 'Sent Attendance Record and Got Response: ', response);
  //         this.showAlert('تم تسجيل الحضور بنجاح', 'success');
  //       },
  //       error: (error) => {
  //         this.isCheckingIn = false;
  //         this.logger.log('error', 'Sent Attendance Record and Got Error Response: ', error);
  //         this.showAlert('حدث خطأ أثناء تسجيل الحضور', 'error');
  //       }
  //     });
  //   } catch (error) {
  //   this.logger.log('error', 'Error in onCheckIn method: ', error);
  //   this.showAlert('حدث خطأ أثناء تحضير البيانات', 'error');
  //   this.isCheckingIn = false; // ✅ Reset the flag
  // }

  // }

  onCheckIn() {
  this.isCheckingIn = true;
  
  // Get device info using observables
  this.getDeviceId().pipe(
    switchMap(deviceId => 
      this.getIpAddress().pipe(
        map(ipAddress => ({ deviceId, ipAddress }))
      )
    ),
    switchMap(({ deviceId, ipAddress }) => {
      this.logger.log('debug', 'Getting Device ID and Network IP: ', { deviceId, ipAddress });

      const checkInData: NewAttendanceRecord = {
        employeeId: this.currentUser!.id,
        deviceId: deviceId,
        ipAddress: ipAddress
      };

      this.logger.log('debug', 'New Attendance Record: ', checkInData);

      return this.attendanceService.checkIn(checkInData);
    })
  ).subscribe({
    next: (response) => {
      this.todayRecord = response;
      this.logger.log('info', 'Sent Attendance Record and Got Response: ', response);
      this.showAlert('تم تسجيل الحضور بنجاح', 'success');
      this.isCheckingIn = false;
    },
    error: (error) => {
      this.logger.log('error', 'Sent Attendance Record and Got Error Response: ', error);
      this.showAlert('حدث خطأ أثناء تسجيل الحضور', 'error');
      this.isCheckingIn = false;
    }
  });
}

  getDeviceId(): Observable<string> {
  return new Observable(observer => {
    try {
      // Simple device fingerprinting
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx!.textBaseline = 'top';
      ctx!.font = '14px Arial';
      ctx!.fillText('Device fingerprint', 2, 2);
      
      const fingerprint = canvas.toDataURL();
      this.logger.log('debug', 'Check In From Get Device ID Method with FingerPrint: ', fingerprint);
      const deviceId = btoa(fingerprint).substring(0, 16);
      observer.next(deviceId);
      observer.complete();
    } catch (error) {
      observer.error(error);
    }
  });
}
  // async getDeviceId(): Promise<string> {
  //   // Simple device fingerprinting
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  //   ctx!.textBaseline = 'top';
  //   ctx!.font = '14px Arial';
  //   ctx!.fillText('Device fingerprint', 2, 2);
    
  //   const fingerprint = canvas.toDataURL();
  //   this.logger.log('debug', 'Check In From Get Device ID Method with FingerPrint: ', fingerprint);
  //   return btoa(fingerprint).substring(0, 16);
  // }

  // async getIpAddress(): Promise<string> {
  //   try {
  //     // TODO: Replace with actual IP detection service
  //     const response = await fetch('https://api.ipify.org?format=json');
  //     const data = await response.json();
  //     this.logger.log('debug', 'Check In From Get Network IP Method with ip: ', data.ip);
  //     return data.ip;
  //   } catch {
  //     this.logger.log('error', 'Error Getting IP Address');
  //     return '127.0.0.1'; // Fallback
  //   }
  // }

  getIpAddress(): Observable<string> {
  return new Observable(observer => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        this.logger.log('debug', 'Check In From Get Network IP Method with ip: ', data.ip);
        observer.next(data.ip);
        observer.complete();
      })
      .catch(error => {
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
