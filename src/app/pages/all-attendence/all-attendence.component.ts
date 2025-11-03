import { DatePipe, CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AttendanceRecord, AttendanceStatus, PaginatedAttendanceResult, ToggleEarlyLeave } from '../../model/attendance-record/attendance-record';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { User } from '../../model/auth/user';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-all-attendence',
  imports: [DatePipe, ReactiveFormsModule, CommonModule],
  templateUrl: './all-attendence.component.html',
  styleUrl: './all-attendence.component.css'
})
export class AllAttendenceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  employees: User[] = [];
  filterForm!: FormGroup;
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 50;
  totalRecords: number = 0;
  totalPages: number = 0;
  loading: boolean = false;

  // Modal properties
  selectedRecord: AttendanceRecord | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    // Initialize form with today's date
    const today = new Date().toISOString().split('T')[0];
    
    this.filterForm = this.fb.group({
      fromDate: [today],
      toDate: [today],
      employeeId: ['']
    });

    // Load employees
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      }
    });

    // Load today's attendance
    this.loadAttendance();
  }

  loadAttendance(): void {
    this.loading = true;
    const formValue = this.filterForm.value;

    const filter = {
      fromDate: formValue.fromDate || undefined,
      toDate: formValue.toDate || undefined,
      employeeId: formValue.employeeId || undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.attendanceService.getPaginatedAttendance(filter).subscribe({
      next: (response: PaginatedAttendanceResult) => {
        this.attendanceRecords = response.records;
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.loading = false;
        console.log("attendance", this.attendanceRecords)
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadAttendance();
  }

  loadPreviousDay(): void {
    const fromDate = new Date(this.filterForm.value.fromDate);
    fromDate.setDate(fromDate.getDate() - 1);
    
    const toDate = new Date(this.filterForm.value.toDate);
    toDate.setDate(toDate.getDate() - 1);

    this.filterForm.patchValue({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    });

    this.loadAttendance();
  }

  loadNextDay(): void {
    const fromDate = new Date(this.filterForm.value.fromDate);
    fromDate.setDate(fromDate.getDate() + 1);
    
    const toDate = new Date(this.filterForm.value.toDate);
    toDate.setDate(toDate.getDate() + 1);

    this.filterForm.patchValue({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    });

    this.loadAttendance();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAttendance();
    }
  }

  clearFilters(): void {
    const today = new Date().toISOString().split('T')[0];
    this.filterForm.patchValue({
      fromDate: today,
      toDate: today,
      employeeId: ''
    });
    this.currentPage = 1;
    this.loadAttendance();
  }

  mapAttendanceStatus(status: AttendanceStatus): string {
    switch(status){
      case AttendanceStatus.Absent:
        return 'غياب';
      case AttendanceStatus.Leave: 
        return 'اجازة';
      case AttendanceStatus.Present:
        return 'حاضر';
    }
  }

  shortTimeSpan(timespan?: string): string {
    if (timespan) {
      return timespan.split('.')[0].substring(0, 5);
    } else {
      return '00:00';
    }
  }

  toggleEarlyLeave(record: AttendanceRecord) {
    this.selectedRecord = record;
    // Show the modal using Bootstrap's modal API
    const modalElement = document.getElementById('earlyLeaveModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmEarlyLeave() {
    if (this.selectedRecord) {
      const earlyLeave: ToggleEarlyLeave = {
        employeeId: this.selectedRecord.employeeId,
        workDate: this.selectedRecord.workDate
      };
      this.attendanceService.toggleEarlyLeave(earlyLeave).subscribe({
        next: (success) => {
          if (success) {
            // Update the local record
            this.selectedRecord!.earlyLeave = !this.selectedRecord!.earlyLeave;
            // Refresh the data to ensure consistency
            this.loadAttendance();
          }
          this.closeModal();
        },
        error: (error) => {
          console.error('Error toggling early leave:', error);
          this.closeModal();
        }
      });
    }
  }

  closeModal() {
    const modalElement = document.getElementById('earlyLeaveModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.selectedRecord = null;
  }
}