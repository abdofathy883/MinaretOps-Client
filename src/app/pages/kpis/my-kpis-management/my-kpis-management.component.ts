import { Component, Input, OnInit } from '@angular/core';
import { IIncedint, IKpiSummary } from '../../../model/kpis/icreate-incedint';
import { KpiService } from '../../../services/kpis/kpi.service';
import { MapKpiAspectPipe } from '../../../core/pipes/kpis/map-kpi-aspect.pipe';

@Component({
  selector: 'app-my-kpis-management',
  imports: [MapKpiAspectPipe],
  templateUrl: './my-kpis-management.component.html',
  styleUrl: './my-kpis-management.component.css'
})
export class MyKpisManagementComponent implements OnInit{
  @Input() currentUserId!: string;
  incedients: IIncedint[] = [];
  summary: IKpiSummary | null = null;
  
  constructor(
    private kpiService: KpiService
  ) { }

  ngOnInit(): void {
    this.kpiService.getIncidentsByEmpId(this.currentUserId).subscribe({
      next: (response) => {
        this.incedients = response;
      }
    });

    this.kpiService.getMySummary(this.currentUserId).subscribe({
      next: (response) => {
        this.summary = response;
      }
    })
  }
}
