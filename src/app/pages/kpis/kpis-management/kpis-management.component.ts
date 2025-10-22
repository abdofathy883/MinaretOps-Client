import { Component, OnInit } from '@angular/core';
import { AddIncedientComponent } from '../add-incedient/add-incedient.component';
import { IIncedint, IKpiSummary } from '../../../model/kpis/icreate-incedint';
import { KpiService } from '../../../services/kpis/kpi.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kpis-management',
  imports: [AddIncedientComponent, FormsModule],
  templateUrl: './kpis-management.component.html',
  styleUrl: './kpis-management.component.css',
})
export class KpisManagementComponent implements OnInit {
  summaries: IKpiSummary[] = [];
  selectedMonthYear: string = '';
  loading: boolean = false;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    this.loadSummaries();
  }

  loadSummaries(month?: number, year?: number): void {
    this.loading = true;
    this.kpiService.getSummaries(month, year).subscribe({
      next: (response) => {
        this.loading = false;
        this.summaries = response;
      },
    });
  }

  onFilter(): void {
    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split('-').map(Number);
      this.loadSummaries(month, year);
    } else {
      this.loadSummaries();
    }
  }
}
