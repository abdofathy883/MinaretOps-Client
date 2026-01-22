import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../model/auth/user';
import { Subject, takeUntil } from 'rxjs';
import { PayrollService } from '../../../services/payroll/payroll.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { IVault } from '../../../model/vault/i-vault';
import { VaultService } from '../../../services/vault/vault.service';

@Component({
  selector: 'app-add-salary-period',
  imports: [ReactiveFormsModule],
  templateUrl: './add-salary-period.component.html',
  styleUrl: './add-salary-period.component.css',
})
export class AddSalaryPeriodComponent {
  currentUserId: string = '';
  salaryPeriodForm: FormGroup;
  employees: User[] = [];
  vaults: IVault[] = [];
  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private authService: AuthService,
    private vaultService: VaultService,
    private router: Router
  ) {
    this.salaryPeriodForm = this.fb.group({
      employeeId: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      bonus: [0, [Validators.required, Validators.min(0)]],
      deductions: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
      createdAt: [new Date(), Validators.required],
      salaryPayments: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadEmployees();
    this.setupEmployeeIdListener();
    this.loadVaults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.authService.getAll().subscribe({
      next: (users) => {
        this.employees = users;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      },
    });
  }

  loadVaults() {
    this.vaultService.getAllLocal().subscribe((response) => this.vaults = response);
  }

  setupEmployeeIdListener(): void {
    this.salaryPeriodForm
      .get('employeeId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((employeeId) => {
        if (employeeId) {
          const selectedEmployee = this.employees.find(
            (emp) => emp.id === employeeId
          );
          if (selectedEmployee && selectedEmployee.baseSalary) {
            this.salaryPeriodForm.patchValue({
              salary: selectedEmployee.baseSalary,
            });
          }
        }
      });
  }

  get salaryPayments(): FormArray {
    return this.salaryPeriodForm.get('salaryPayments') as FormArray;
  }

  addPayment(): void {
    const paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      notes: [''],
      vaultId: [1, [Validators.required]],
      currencyId: [1, [Validators.required]],
    });
    this.salaryPayments.push(paymentForm);
  }

  removePayment(index: number): void {
    this.salaryPayments.removeAt(index);
  }

  onSubmit(): void {
    if (this.salaryPeriodForm.invalid) {
      this.showAlert('يرجى ملء جميع الحقول المطلوبة', 'danger');
      return;
    }

    this.isLoading = true;
    const formValue = this.salaryPeriodForm.value;

    const createDto = {
      employeeId: formValue.employeeId,
      salary: formValue.salary,
      bonus: formValue.bonus,
      deductions: formValue.deductions,
      notes: formValue.notes || '',
      createdAt: formValue.createdAt,
      salaryPayments: formValue.salaryPayments.map((p: any) => ({
        employeeId: formValue.employeeId,
        amount: p.amount,
        notes: p.notes || '',
        vaultId: p.vaultId,
        currencyId: p.currencyId,
        createdBy: this.currentUserId,
      })),
    };

    this.payrollService
      .createSalaryPeriod(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showAlert('تم إنشاء فترة الراتب بنجاح', 'success');
          setTimeout(() => {
            this.router.navigate(['/payroll/periods', result.id]);
          }, 1500);
        },
        error: (err) => {
          this.showAlert(
            err.error?.message || 'خطأ في إنشاء فترة الراتب',
            'danger'
          );
          this.isLoading = false;
        },
      });
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  cancel(): void {
    this.router.navigate(['/payroll/periods']);
  }
}
