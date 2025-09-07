import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AttendanceRecord } from '../../model/attendance-record/attendance-record';
import { AttendanceService } from '../../services/attendance/attendance.service';

@Component({
  selector: 'app-all-attendence',
  imports: [DatePipe],
  templateUrl: './all-attendence.component.html',
  styleUrl: './all-attendence.component.css'
})
export class AllAttendenceComponent implements OnInit{
  attendanceRecords: AttendanceRecord[] = [];

  constructor(private attendanceService: AttendanceService) { }

  ngOnInit(): void {
    this.attendanceService.getAllAttendance().subscribe({
      next: (response) => {
        this.attendanceRecords = response;
      },
      error: (error) => {
        console.error('Error fetching attendance records:', error);
      }
    })
  }
}
