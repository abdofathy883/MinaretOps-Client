import { Component, signal, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BranchService } from '../../../services/branch/branch.service';
import { IBranch } from '../../../model/branch/i-branch';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';

@Component({
  selector: 'app-all-branches',
  imports: [CommonModule, ShimmerComponent],
  templateUrl: './all-branches.component.html',
  styleUrl: './all-branches.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllBranchesComponent implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  branches = signal<IBranch[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading.set(true);
    this.branchService.getAll().subscribe({
      next: (response) => {
        this.branches.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  goToBranch(id: number): void {
    this.router.navigate(['/branches', id]);
  }

  goToAddBranch(): void {
    this.router.navigate(['/branches/add']);
  }
}
