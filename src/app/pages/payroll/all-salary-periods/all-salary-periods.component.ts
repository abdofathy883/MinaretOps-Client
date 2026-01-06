import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PayrollService } from '../../../services/payroll/payroll.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../model/auth/user';
import { CommonModule } from '@angular/common';
import { ISalaryPeriod } from '../../../model/salary/i-salary-payment';

@Component({
  selector: 'app-all-salary-periods',
  imports: [CommonModule],
  templateUrl: './all-salary-periods.component.html',
  styleUrl: './all-salary-periods.component.css'
})
export class AllSalaryPeriodsComponent implements OnInit, OnDestroy {
  salaryPeriods: ISalaryPeriod[] = [];
  employees: User[] = [];
  filteredPeriods: ISalaryPeriod[] = [];
  selectedEmployeeId: string = '';
  isLoading = false;
  isUserAdmin = false;
  isUserAccountManager = false;

  alertMessage = '';
  alertType = 'info';

  private destroy$ = new Subject<void>();

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserRoles();
    this.loadEmployees();
    this.loadSalaryPeriods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserRoles(): void {
    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) {
        this.isUserAdmin = true;
      }
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) {
        this.isUserAccountManager = true;
      }
    });
  }

  loadEmployees(): void {
    this.authService.getAll().subscribe({
      next: (users) => {
        this.employees = users;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      }
    });
  }

  loadSalaryPeriods(): void {
    this.isLoading = true;
    this.payrollService.getAllSalaryPeriods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (periods) => {
          this.salaryPeriods = periods;
          this.filteredPeriods = periods;
          this.isLoading = false;
        },
        error: (err) => {
          this.showAlert('خطأ في تحميل فترات الرواتب', 'danger');
          this.isLoading = false;
        }
      });
  }

  filterByEmployee(): void {
    if (!this.selectedEmployeeId) {
      this.filteredPeriods = this.salaryPeriods;
      return;
    }
    this.filteredPeriods = this.salaryPeriods.filter(
      p => p.employeeId === this.selectedEmployeeId
    );
  }

  viewPeriod(periodId: number): void {
    this.router.navigate(['/payroll/periods', periodId]);
  }

  createPeriod(): void {
    this.router.navigate(['/payroll/periods/add']);
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}
