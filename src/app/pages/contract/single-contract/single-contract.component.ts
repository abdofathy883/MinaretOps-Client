import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../../services/contracts/contract.service';
import { IContract } from '../../../model/contract/i-contract';
import { BusinessType } from '../../../model/client/client';

@Component({
  selector: 'app-single-contract',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-contract.component.html',
  styleUrl: './single-contract.component.css',
})
export class SingleContractComponent implements OnInit {
  contract: IContract | null = null;
  loading = false;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContract();
  }

  loadContract(): void {
    const contractIdParam = this.route.snapshot.paramMap.get('id');
    const contractId = Number(contractIdParam);

    if (contractId) {
      this.loading = true;
      this.contractService.getById(contractId).subscribe({
        next: (response) => {
          this.contract = response;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showAlert('حدث خطأ في تحميل بيانات العقد', 'error');
        },
      });
    }
  }

  getBusinessTypeText(businessType: BusinessType): string {
    switch (businessType) {
      case BusinessType.Individual:
        return 'فردي';
      case BusinessType.Commercial:
        return 'تجاري';
      default:
        return 'غير معروف';
    }
  }

  goToClient(clientId: number): void {
    this.router.navigate(['/clients', clientId]);
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/contracts']);
  }
}
