import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../services/contracts/contract.service';
import { ClientService } from '../../../services/clients/client.service';
import { LightWieghtClient } from '../../../model/client/client';
import { ICreateContract } from '../../../model/contract/i-contract';
import {
  getErrorMessage,
  hasError,
} from '../../../services/helper-services/utils';
import { IVault } from '../../../model/vault/i-vault';
import { VaultService } from '../../../services/vault/vault.service';

@Component({
  selector: 'app-add-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-contract.component.html',
  styleUrl: './add-contract.component.css',
})
export class AddContractComponent implements OnInit {
  contractForm: FormGroup;
  clients: LightWieghtClient[] = [];
  vaults: IVault[] = [];
  currentUserId: string = '';

  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private clientService: ClientService,
    private vaultService: VaultService,
    private router: Router,
  ) {
    this.contractForm = this.fb.group({
      clientId: ['', [Validators.required]],
      currencyId: ['', [Validators.required]],
      contractDuration: [
        '',
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      ],
      contractTotal: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      paidAmount: [''],
      vaultId: ['', [Validators.required]],
      createdAt: [''],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadVaults();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response;
      },
      error: () => {
        this.showAlert('حدث خطأ في تحميل قائمة العملاء', 'error');
      },
    });
  }

  loadVaults(): void {
    this.vaultService.getAllLocal().subscribe({
      next: (response) => {
        this.vaults = response;
      },
      error: () => {
        this.showAlert('حدث خطأ في تحميل قائمة العملات', 'error');
      },
    });
  }

  onSubmit(): void {
    // if (this.contractForm.invalid) {
    //   this.contractForm.markAllAsTouched();
    //   return;
    // }

    this.isLoading = true;
    const formValue = this.contractForm.value;

    const contractData: ICreateContract = {
      clientId: Number(formValue.clientId),
      currencyId: formValue.currencyId,
      contractDuration: Number(formValue.contractDuration),
      contractTotal: Number(formValue.contractTotal),
      paidAmount: Number(formValue.paidAmount),
      vaultId: formValue.vaultId,
      createdAt: formValue.createdAt || null,
    };

    console.log('Submitting contract data:', contractData);

    this.contractService.create(contractData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showAlert('تم إضافة العقد بنجاح', 'success');
        setTimeout(() => {
          this.router.navigate(['/contracts', response.id]);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage =
          error.error?.message || 'حدث خطأ أثناء إضافة العقد';
          console.log('Error adding contract:', error);
        this.showAlert(errorMessage, 'error');
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
    this.router.navigate(['/contracts']);
  }

  hasError = hasError;
  getErrorMessage = getErrorMessage;
}
