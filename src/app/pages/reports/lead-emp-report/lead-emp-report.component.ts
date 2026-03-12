import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { LeadReportingService } from '../../../services/reporting/lead-reporting.service';
import { ILeadEmployeeReport } from '../../../model/reporting/i-lead-employee-report';
import { ISalesLead, CurrentLeadStatus } from '../../../model/sales/i-sales-lead';

@Component({
  selector: 'app-lead-emp-report',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-emp-report.component.html',
  styleUrl: './lead-emp-report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeadEmpReportComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  employeeReports: ILeadEmployeeReport[] = [];
  expandedEmployees: Set<string> = new Set();
  
  filterForm!: FormGroup;
  private currentUserId: string = '';

  constructor(
    private leadReportingService: LeadReportingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    
    const today = new Date().toISOString().split('T')[0];
    
    this.filterForm = this.fb.group({
      fromDate: [today],
      toDate: [today]
    });
    
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck(); 

    const formValue = this.filterForm.value;
    const fromDate = formValue.fromDate ? new Date(formValue.fromDate) : undefined;
    const toDate = formValue.toDate ? new Date(formValue.toDate) : undefined;

    this.leadReportingService.getLeadEmployeeReport(this.currentUserId, fromDate, toDate).subscribe({
      next: (reports) => {
        this.employeeReports = reports;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'فشل تحميل التقرير';
        this.loading = false;
        this.cdr.markForCheck(); 
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.loadReport();
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

    this.loadReport();
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

    this.loadReport();
  }

  toggleEmployee(employeeId: string): void {
    if (this.expandedEmployees.has(employeeId)) {
      this.expandedEmployees.delete(employeeId);
    } else {
      this.expandedEmployees.add(employeeId);
    }
    this.cdr.markForCheck();
  }

  isExpanded(employeeId: string): boolean {
    return this.expandedEmployees.has(employeeId);
  }

  goToLead(id: number) {
    this.router.navigate(['leads/details', id]);
  }

  getLeadStatusText(status: CurrentLeadStatus): string {
    const texts: { [key: number]: string } = {
      0: 'عميل جديد',
      1: 'المكالمة الأولى',
      2: 'مهتم',
      3: 'إجتماع متفق عليه',
      4: 'محتمل',
      5: 'تم التعاقد',
      6: 'غير محتمل'
    };
    return texts[status] || 'غير محدد';
  }

  getLeadStatusClass(status: CurrentLeadStatus): string {
    const classes: { [key: number]: string } = {
      0: 'badge bg-primary',
      1: 'badge bg-info',
      2: 'badge bg-secondary',
      3: 'badge bg-warning text-dark',
      4: 'badge bg-purple text-light',
      5: 'badge bg-success',
      6: 'badge bg-danger'
    };
    return classes[status] || 'badge bg-secondary';
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    return new DatePipe('en-US').transform(date, 'short') || '';
  }

  trackByEmployeeId(index: number, report: ILeadEmployeeReport): string {
    return report.employeeId;
  }

  trackByLeadId(index: number, lead: ISalesLead): number {
    return lead.id;
  }
}
