import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from '../../../services/currency/currency.service';
import { ICurrency, ICreateCurrency } from '../../../model/currency/i-currency';
import { IExchangeRate, ICreateExchangeRate } from '../../../model/currency/i-exchange-rate';

@Component({
  selector: 'app-single-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './single-currency.component.html',
  styleUrl: './single-currency.component.css'
})
export class SingleCurrencyComponent implements OnInit {
  currency: ICurrency | null = null;
  exchangeRates: IExchangeRate[] = [];
  allCurrencies: ICurrency[] = [];
  loading = false;
  alertMessage = '';
  alertType = 'info';
  showAddExchangeRateForm = false;
  
  exchangeRateForm: FormGroup;

  constructor(
    private currencyService: CurrencyService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.exchangeRateForm = this.fb.group({
      fromCurrencyId: ['', Validators.required],
      toCurrencyId: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0.000001)]],
      effectiveFrom: ['', Validators.required],
      effectiveTo: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCurrency();
    this.loadAllCurrencies();
  }

  loadCurrency(): void {
    const currencyIdParam = this.route.snapshot.paramMap.get('id');
    const currencyId = Number(currencyIdParam);

    if (currencyId) {
      this.loading = true;
      this.currencyService.getById(currencyId).subscribe({
        next: (response) => {
          this.currency = response;
          this.loadExchangeRates(currencyId);
        },
        error: () => {
          this.loading = false;
          this.showAlert('حدث خطأ في تحميل بيانات العملة', 'error');
        }
      });
    }
  }

  loadAllCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (currencies) => {
        this.allCurrencies = currencies;
      },
      error: () => {
        this.showAlert('حدث خطأ في تحميل قائمة العملات', 'error');
      }
    });
  }

  loadExchangeRates(currencyId: number): void {
    this.currencyService.getExchangeRatesByCurrencyId(currencyId).subscribe({
      next: (rates) => {
        this.exchangeRates = rates;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showAlert('حدث خطأ في تحميل أسعار الصرف', 'error');
      }
    });
  }

  openAddExchangeRateForm(): void {
    if (!this.currency) return;
    
    this.exchangeRateForm.reset({
      fromCurrencyId: this.currency.id,
      toCurrencyId: '',
      rate: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      isActive: true
    });
    this.showAddExchangeRateForm = true;
  }

  cancelAddExchangeRate(): void {
    this.showAddExchangeRateForm = false;
    this.exchangeRateForm.reset();
  }

  saveExchangeRate(): void {
    if (this.exchangeRateForm.invalid) {
      this.exchangeRateForm.markAllAsTouched();
      return;
    }

    if (!this.currency) {
      this.showAlert('خطأ: لم يتم تحديد العملة', 'error');
      return;
    }

    const formValue = this.exchangeRateForm.value;
    
    // Validate that currencies are different
    if (formValue.fromCurrencyId === formValue.toCurrencyId) {
      this.showAlert('يجب اختيار عملة مختلفة للتحويل إليها', 'error');
      return;
    }

    this.loading = true;
    const newExchangeRate: ICreateExchangeRate = {
      fromCurrencyId: formValue.fromCurrencyId,
      toCurrencyId: formValue.toCurrencyId,
      rate: formValue.rate,
      effectiveFrom: formValue.effectiveFrom,
      effectiveTo: formValue.effectiveTo || null,
      isActive: formValue.isActive ?? true
    };

    this.currencyService.createExchangeRate(newExchangeRate).subscribe({
      next: () => {
        this.loading = false;
        this.showAddExchangeRateForm = false;
        this.exchangeRateForm.reset();
        this.loadExchangeRates(this.currency!.id);
        this.showAlert('تم إضافة سعر الصرف بنجاح', 'success');
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          error?.error?.message ||
          error?.error ||
          error?.message ||
          'حدث خطأ في إضافة سعر الصرف';
        this.showAlert(errorMessage, 'error');
      }
    });
  }

  getCurrencyName(currencyId: number): string {
    const currency = this.allCurrencies.find(c => c.id === currencyId);
    return currency ? `${currency.code} - ${currency.name}` : 'غير معروف';
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG');
  }

  hasError(controlName: string): boolean {
    const control = this.exchangeRateForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.exchangeRateForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['min']) {
      return `يجب أن تكون القيمة ${control.errors['min'].min} على الأقل`;
    }

    return 'قيمة غير صحيحة';
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert(): void {
    this.alertMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/currency']);
  }

  getFilteredCurrencies(): ICurrency[] {
    if (!this.currency) return [];
    return this.allCurrencies.filter(c => c.id !== this.currency!.id);
  }
}

