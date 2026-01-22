import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PayrollService } from '../../../services/payroll/payroll.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ICreateSalaryPayment, ISalaryPeriod } from '../../../model/salary/i-salary-payment';
import { CommonModule } from '@angular/common';
import { VaultService } from '../../../services/vault/vault.service';
import { IVault } from '../../../model/vault/i-vault';

@Component({
  selector: 'app-single-salary-period',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './single-salary-period.component.html',
  styleUrl: './single-salary-period.component.css'
})
export class SingleSalaryPeriodComponent implements OnInit {
  @Input() id?: number;
  period: ISalaryPeriod | null = null;
  isLoading = false;
  showPaymentModal = false;
  paymentForm!: FormGroup;
  alertMessage = '';
  alertType = 'info';
  vaults: IVault[] = [];
  currentUserId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private vaultService: VaultService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {  }

  ngOnInit(): void {
    this.initializePaymentForm();
    this.loadUserRoles();
    const periodId = this.id || this.route.snapshot.params['id'];
    if (periodId) {
      this.loadSalaryPeriod(periodId);
    }
    this.loadVaults();
  }

  initializePaymentForm() {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currencyId: [1, [Validators.required]],
      vaultId: [1, [Validators.required]],
      notes: ['']
    });
  }

  loadVaults() {
    this.vaultService.getAllLocal().subscribe((response) => this.vaults = response);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserRoles(): void {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  loadSalaryPeriod(periodId: number): void {
    this.isLoading = true;
    this.payrollService.getSalaryPeriodById(periodId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (period) => {
          this.period = period;
          this.isLoading = false;
        },
        error: (err) => {
          this.showAlert('خطأ في تحميل فترة الراتب', 'danger');
          this.isLoading = false;
        }
      });
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentForm.reset();
  }

  recordPayment(): void {
    if (this.paymentForm.invalid || !this.period) {
      return;
    }

    const formValue = this.paymentForm.value;
    const paymentDto: ICreateSalaryPayment = {
      employeeId: this.period.employeeId,
      salaryPeriodId: this.period.id,
      vaultId: formValue.vaultId,
      currencyId: formValue.currencyId,
      createdBy: this.currentUserId,
      amount: formValue.amount,
      notes: formValue.notes || ''
    };

    console.log(paymentDto)

    this.isLoading = true;
    this.payrollService.recordSalaryPayment(paymentDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showAlert('تم تسجيل الدفعة بنجاح', 'success');
          this.closePaymentModal();
          this.loadSalaryPeriod(this.period!.id);
        },
        error: (err) => {
          console.log(err)
          this.showAlert(err.error?.message || 'خطأ في تسجيل الدفعة', 'danger');
          this.isLoading = false;
        }
      });
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}
