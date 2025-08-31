import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AttendanceRecord } from '../../model/attendance-record/attendance-record';

@Component({
  selector: 'app-all-attendence',
  imports: [DatePipe],
  templateUrl: './all-attendence.component.html',
  styleUrl: './all-attendence.component.css'
})
export class AllAttendenceComponent {
  attendanceRecords: AttendanceRecord[] = [];
}
