import { Component } from '@angular/core';
import { InternalTask, InternalTaskType } from '../../../model/internal-task/internal-task';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';

@Component({
  selector: 'app-internal-archive',
  imports: [CommonModule, MapTaskStatusPipe, MapTaskStatusClassPipe],
  templateUrl: './internal-archive.component.html',
  styleUrl: './internal-archive.component.css'
})
export class InternalArchiveComponent {
internalTasks: InternalTask[] = [];

  constructor(
    private internalTaskService: InternalTaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInternalTasks();
  }

  loadInternalTasks() {
    this.internalTaskService.getArchivedTasks().subscribe({
      next: (response) => {
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
