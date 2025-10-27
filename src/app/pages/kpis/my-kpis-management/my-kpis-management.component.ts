import { Component, Input, OnInit } from '@angular/core';
import { IIncedint, IKpiSummary } from '../../../model/kpis/icreate-incedint';
import { KpiService } from '../../../services/kpis/kpi.service';
import { MapKpiAspectPipe } from '../../../core/pipes/kpis/map-kpi-aspect.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-kpis-management',
  imports: [MapKpiAspectPipe, FormsModule],
  templateUrl: './my-kpis-management.component.html',
  styleUrl: './my-kpis-management.component.css',
})
export class MyKpisManagementComponent implements OnInit {
  @Input() userId!: string;
  incedients: IIncedint[] = [];
  summary: IKpiSummary | null = null;
  selectedMonthYear: string = '';
  loading: boolean = false;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    this.loadIncedients();
    this.loadSummaries();
  }

  loadSummaries(month?: number, year?: number): void {
    this.loading = true;
    this.kpiService.getMySummary(this.userId, month, year).subscribe({
      next: (response) => {
        this.loading = false;
        this.summary = response;
      },
    });
  }

  loadIncedients(month?: number, year?: number): void {
    this.loading = true;
    this.kpiService.getIncidentsByEmpId(this.userId, month, year).subscribe({
      next: (response) => {
        this.loading = false;
        this.incedients = response;
      },
    });
  }

  onFilter(): void {
    if (this.selectedMonthYear) {
      const [year, month] = this.selectedMonthYear.split('-').map(Number);
      this.loadSummaries(month, year);
      this.loadIncedients(month, year);
    } else {
      this.loadSummaries();
      this.loadIncedients();
    }
  }
}
