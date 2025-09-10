import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AttendanceRecord } from '../../model/attendance-record/attendance-record';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { User } from '../../model/auth/user';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-attendence',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './all-attendence.component.html',
  styleUrl: './all-attendence.component.css'
})
export class AllAttendenceComponent implements OnInit{
  attendanceRecords: AttendanceRecord[] = [];
  employees: User[] = [];
  filterForm!: FormGroup;
  filteredAttendanceRecords: AttendanceRecord[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      date: [null],
      employeeId: [null]
    })
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      }
    })
    this.attendanceService.getAllAttendance().subscribe({
      next: (response) => {
        this.attendanceRecords = response;
        this.filteredAttendanceRecords = [...this.attendanceRecords];
      },
      error: (error) => {
        console.error('Error fetching attendance records:', error);
      }
    })
  }

  applyFilters() {
    const filterDate = this.filterForm.value.date;
    const filterEmpId = this.filterForm.value.employeeId;

    this.filteredAttendanceRecords = this.attendanceRecords.filter(record => {
      let matches = true;
      if (filterEmpId && record.employeeId !== filterEmpId) {
        matches = false;
      }
      if (filterDate && record.checkInTime !== filterDate) {
        matches = false;
      }
      return matches;
    });
  }
}
