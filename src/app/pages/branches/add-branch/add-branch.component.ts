import {
  Component,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch/branch.service';
import { CurrencyService } from '../../../services/currency/currency.service';
import { ICurrency } from '../../../model/currency/i-currency';
import { ICreateBranch } from '../../../model/branch/i-branch';
import {
  hasError,
  getErrorMessage,
} from '../../../services/helper-services/utils';

@Component({
  selector: 'app-add-branch',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-branch.component.html',
  styleUrl: './add-branch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBranchComponent implements OnInit {
  // private readonly fb = inject(FormBuilder);
  // private readonly branchService = inject(BranchService);
  // private readonly currencyService = inject(CurrencyService);
  // private readonly router = inject(Router);

  branchForm!: FormGroup;

  constructor(
    private branchService: BranchService,
    private currencyService: CurrencyService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: ['', [Validators.maxLength(50)]],
      currencyId: ['', [Validators.required]],
    });
  }

  currencies = signal<ICurrency[]>([]);
  isLoading = signal<boolean>(false);
  alertMessage = signal<string>('');
  alertType = signal<'info' | 'success' | 'error'>('info');

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (response) => {
        this.currencies.set(response);
      },
      error: () => {
        this.showAlert('حدث خطأ في تحميل قائمة العملات', 'error');
      },
    });
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const branchData: ICreateBranch = {
      name: this.branchForm.value.name,
      code: this.branchForm.value.code,
      currencyId: Number(this.branchForm.value.currencyId),
    };

    this.branchService.create(branchData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.showAlert('تم إضافة الفرع بنجاح', 'success');
        setTimeout(() => {
          this.router.navigate(['/branches', response.id]);
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage =
          error.error?.message || 'حدث خطأ أثناء إضافة الفرع';
          console.log(error)
        this.showAlert(errorMessage, 'error');
      },
    });
  }

  showAlert(message: string, type: 'info' | 'success' | 'error'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => {
      this.alertMessage.set('');
    }, 5000);
  }

  cancel(): void {
    this.router.navigate(['/branches']);
  }

  hasError = hasError;
  getErrorMessage = getErrorMessage;
}
