import { Component, OnInit } from '@angular/core';
import { AddIncedientComponent } from "../add-incedient/add-incedient.component";
import { IIncedint, IKpiSummary } from '../../../model/kpis/icreate-incedint';
import { KpiService } from '../../../services/kpis/kpi.service';

@Component({
  selector: 'app-kpis-management',
  imports: [AddIncedientComponent],
  templateUrl: './kpis-management.component.html',
  styleUrl: './kpis-management.component.css'
})
export class KpisManagementComponent implements OnInit{
summaries: IKpiSummary[] = [];

  constructor(
    private kpiService: KpiService
  ) { }

  ngOnInit(): void {
    this.kpiService.getSummaries().subscribe({
      next: (response) => {
        this.summaries = response;
      }
    });
  }
}
