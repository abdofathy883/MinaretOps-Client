import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { InternalTask, InternalTaskType } from '../../../model/internal-task/internal-task';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';
import { ShimmerComponent } from "../../../shared/shimmer/shimmer.component";

@Component({
  selector: 'app-all-internal-tasks',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MapTaskStatusClassPipe,
    MapTaskStatusPipe,
    ShimmerComponent
],
  templateUrl: './all-internal-tasks.component.html',
  styleUrl: './all-internal-tasks.component.css',
})
export class AllInternalTasksComponent implements OnInit {
  internalTasks: InternalTask[] = [];
  currentUserId: string = '';
  isLoadingTasks: boolean = false;

  constructor(
    private internalTaskService: InternalTaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadInternalTasks();
  }

  loadInternalTasks() {
    this.isLoadingTasks = true;
    this.internalTaskService.getTasksByEmp(this.currentUserId).subscribe({
      next: (response) => {
        this.isLoadingTasks = false;
        this.internalTasks = response;
      },
    });
  }

  goToTask(id: number) {
    this.router.navigate(['/internal-tasks', id]);
  }

  getTypeLabel(type: InternalTaskType): string {
    switch (type) {
      case InternalTaskType.Check:
        return 'Check';
      case InternalTaskType.ClientFollowUp:
        return 'Client Follow Up';
      case InternalTaskType.ClientOnboarding:
        return 'Client Onboarding';
      case InternalTaskType.ExistingClientMeeting:
        return 'Existing Client Meeting';
      case InternalTaskType.FinancialAdjustments:
        return 'Financial Adjustments';
      case InternalTaskType.HRMeeting:
        return 'HR Meeting';
      case InternalTaskType.ManagementMeeting:
        return 'Management Meeting';
      case InternalTaskType.MarketingOffer:
        return 'Marketing Offer';
      case InternalTaskType.ModifyTables:
        return 'Modify Tables';
      case InternalTaskType.PaymentsAndFinance:
        return 'Payments and Finance';
      case InternalTaskType.PotentialClientMeeting:
        return 'Potential Client Meeting';
      case InternalTaskType.ProductionFollowUp:
        return 'Production Follow Up';
      case InternalTaskType.ProjectManagementMeeting:
        return 'Project Management Meeting';
      case InternalTaskType.Quotations:
        return 'Quotations';
      case InternalTaskType.Recruitment:
        return 'Recruitment';
      case InternalTaskType.SalesTeamHandling:
        return 'Sales Team Handling';
      case InternalTaskType.Subscriptions:
        return 'Subscriptions';
      case InternalTaskType.TasksAllocation:
        return 'Tasks Allocation';
      case InternalTaskType.TasksUpdate:
        return 'Tasks Update';
      case InternalTaskType.UpdatingKPIs:
        return 'Updating KPIs';
      case InternalTaskType.UpdatingReports:
        return 'Updating Reports';
      default:
        return 'Unknown';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'مستعجل':
        return 'priority-high';
      case 'مهم':
        return 'priority-medium';
      case 'عادي':
        return 'priority-normal';
      default:
        return 'priority-normal';
    }
  }
}
