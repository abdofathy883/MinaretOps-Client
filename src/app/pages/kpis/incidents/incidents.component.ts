import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapKpiAspectPipe } from "../../../core/pipes/kpis/map-kpi-aspect.pipe";
import { KpiService } from '../../../services/kpis/kpi.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import { IIncedint } from '../../../model/kpis/icreate-incedint';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incidents',
  imports: [CommonModule, MapKpiAspectPipe, FormsModule],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.css'
})
export class IncidentsComponent implements OnInit{
  employees: User[] = [];
  allIncidents: IIncedint[] = [];
  incidents: IIncedint[] = [];

  selectedMonthYear: string = '';
  selectedEmployeeId: string = '';

  isLoading: boolean = false;
  
  constructor(private kpiService: KpiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getAll().subscribe((response) => this.employees = response);
    this.loadAllIncidents();
  }

  loadAllIncidents(): void {
    this.isLoading = true;
    this.kpiService.getAllIncidents().subscribe({
      next: (response) => {
        this.allIncidents = response ?? [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.allIncidents = [];
        this.incidents = [];
        this.isLoading = false;
      }
    });
  }

  onFilter(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedMonthYear = '';
    this.selectedEmployeeId = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    const employeeId = (this.selectedEmployeeId || '').trim();
    const { month, year } = this.parseSelectedMonthYear();

    this.incidents = this.allIncidents.filter((incident) => {
      if (employeeId && incident.employeeId !== employeeId) {
        return false;
      }
      if (month !== undefined && year !== undefined) {
        const incidentDate = this.getIncidentDate(incident);
        if (!incidentDate) {
          return false;
        }
        return (
          incidentDate.getFullYear() === year &&
          incidentDate.getMonth() + 1 === month
        );
      }
      return true;
    });
  }

  private parseSelectedMonthYear(): { month?: number; year?: number } {
    const value = (this.selectedMonthYear || '').trim(); // expected "YYYY-MM"
    if (!value) return {};

    const [y, m] = value.split('-').map((x) => Number(x));
    if (!y || !m || m < 1 || m > 12) return {};

    return { year: y, month: m };
  }

  private getIncidentDate(incident: IIncedint): Date | null {
    const raw: unknown = (incident as any).timeStamp ?? (incident as any).date;
    if (!raw) return null;

    const d = new Date(raw as any);
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
