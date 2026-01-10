import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContractService } from '../../../services/contracts/contract.service';
import { IContract } from '../../../model/contract/i-contract';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';

@Component({
  selector: 'app-all-contracts',
  standalone: true,
  imports: [CommonModule, ShimmerComponent],
  templateUrl: './all-contracts.component.html',
  styleUrl: './all-contracts.component.css',
})
export class AllContractsComponent implements OnInit {
  contracts: IContract[] = [];
  isLoading = false;

  constructor(
    private contractService: ContractService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading = true;
    this.contractService.getAll().subscribe({
      next: (response) => {
        this.contracts = response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  goToContract(id: number): void {
    this.router.navigate(['/contracts', id]);
  }

  goToAddContract(): void {
    this.router.navigate(['/contracts/add']);
  }
}
