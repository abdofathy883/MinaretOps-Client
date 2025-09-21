import { Component, OnInit } from '@angular/core';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import {
  InternalTask,
  InternalTaskType,
} from '../../../model/internal-task/internal-task';
import { Router } from '@angular/router';
import { CustomTaskStatus } from '../../../model/task/task';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-internal-tasks',
  imports: [CommonModule],
  templateUrl: './all-internal-tasks.component.html',
  styleUrl: './all-internal-tasks.component.css',
})
export class AllInternalTasksComponent implements OnInit {
  internalTasks: InternalTask[] = [];

  constructor(
    private internalTaskService: InternalTaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInternalTasks();
  }

  loadInternalTasks() {
    this.internalTaskService.getAll().subscribe({
      next: (response) => {
        this.internalTasks = response;
        console.log('Fetched tasks:', response);
      }
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

  getStatusClass(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open:
        return 'status-not-started';
      case CustomTaskStatus.Acknowledged:
        return 'status-acknowledged';
      case CustomTaskStatus.InProgress:
        return 'status-in-progress';
      case CustomTaskStatus.UnderReview:
        return 'status-under-review';
      case CustomTaskStatus.NeedsEdits:
        return 'status-needs-edits';
      case CustomTaskStatus.Completed:
        return 'status-completed';
      default:
        return 'status-unknown';
    }
  }

  getStatusLabel(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open:
        return 'لم تبدأ';
      case CustomTaskStatus.Acknowledged:
        return 'تم الإقرار';
      case CustomTaskStatus.InProgress:
        return 'قيد التنفيذ';
      case CustomTaskStatus.UnderReview:
        return 'قيد المراجعة';
      case CustomTaskStatus.NeedsEdits:
        return 'تحتاج إلى تعديلات';
      case CustomTaskStatus.Completed:
        return 'مكتمل';
      default:
        return 'غير محدد';
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
