import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyService } from '../../../services/currency/currency.service';
import { ICurrency, ICreateCurrency } from '../../../model/currency/i-currency';

@Component({
  selector: 'app-all-currencies',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './all-currencies.component.html',
  styleUrl: './all-currencies.component.css'
})
export class AllCurrenciesComponent implements OnInit {
  currencies: ICurrency[] = [];
  loading = false;
  showEditModal = false;
  showAddModal = false;
  selectedCurrency: ICurrency | null = null;
  currencyForm: FormGroup;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private currencyService: CurrencyService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.currencyForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      decimalPlaces: [
        2,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(10),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.loading = true;
    this.currencyService.getAll().subscribe({
      next: (currencies) => {
        this.currencies = currencies;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showAlert('حدث خطأ في تحميل العملات', 'error');
      },
    });
  }

  openAddModal(): void {
    this.selectedCurrency = null;
    this.currencyForm.reset({
      code: '',
      name: '',
      decimalPlaces: 2,
    });
    this.showAddModal = true;
  }

  openEditModal(currency: ICurrency): void {
    // Navigate to single currency page instead of opening modal
    this.router.navigate(['/currency', currency.id]);
  }

  closeModal(): void {
    this.showEditModal = false;
    this.showAddModal = false;
    this.selectedCurrency = null;
    this.currencyForm.reset({
      code: '',
      name: '',
      decimalPlaces: 2,
    });
  }

  saveCurrency(): void {
    if (this.currencyForm.invalid) {
      this.currencyForm.markAllAsTouched();
      return;
    }

    if (this.selectedCurrency) {
      this.updateCurrency();
    } else {
      this.createCurrency();
    }
  }

  createCurrency(): void {
    this.loading = true;
    const formValue = this.currencyForm.value;
    const newCurrency: ICreateCurrency = {
      code: formValue.code,
      name: formValue.name,
      decimalPlaces: formValue.decimalPlaces,
    };

    this.currencyService.create(newCurrency).subscribe({
      next: () => {
        this.loading = false;
        this.closeModal();
        this.loadCurrencies();
        this.showAlert('تم إضافة العملة بنجاح', 'success');
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          error?.error?.message ||
          error?.error ||
          error?.message ||
          'حدث خطأ في إضافة العملة';
        this.showAlert(errorMessage, 'error');
      },
    });
  }

  updateCurrency(): void {
    if (!this.selectedCurrency) return;

    this.loading = true;
    const formValue = this.currencyForm.value;
    const updateData: ICreateCurrency = {
      code: formValue.code,
      name: formValue.name,
      decimalPlaces: formValue.decimalPlaces,
    };

    this.currencyService.update(this.selectedCurrency.id, updateData).subscribe({
      next: () => {
        this.loading = false;
        this.closeModal();
        this.loadCurrencies();
        this.showAlert('تم تحديث العملة بنجاح', 'success');
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          error?.error?.message ||
          error?.error ||
          error?.message ||
          'حدث خطأ في تحديث العملة';
        this.showAlert(errorMessage, 'error');
      },
    });
  }

  hasError(controlName: string): boolean {
    const control = this.currencyForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.currencyForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength']) {
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    }
    if (control.errors['maxlength']) {
      return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;
    }
    if (control.errors['min']) {
      return `يجب أن تكون القيمة ${control.errors['min'].min} على الأقل`;
    }
    if (control.errors['max']) {
      return `يجب أن تكون القيمة ${control.errors['max'].max} على الأكثر`;
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
}
