import { Component, OnInit } from '@angular/core';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { ActivatedRoute } from '@angular/router';
import { InternalTask } from '../../../model/internal-task/internal-task';
import { CustomTaskStatus } from '../../../model/client/client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-single-internal-task',
  imports: [CommonModule],
  templateUrl: './single-internal-task.component.html',
  styleUrl: './single-internal-task.component.css',
})
export class SingleInternalTaskComponent implements OnInit {
  internalTask: InternalTask | null = null;
  updatingStatus = false;

  availableStatuses = [
    { value: CustomTaskStatus.Open, label: 'لم تبدأ', icon: 'bi bi-clock' },
    {
      value: CustomTaskStatus.Acknowledged,
      label: 'تم الإقرار',
      icon: 'bi bi-hand-thumbs-up',
    },
    {
      value: CustomTaskStatus.InProgress,
      label: 'قيد التنفيذ',
      icon: 'bi bi-play-circle',
    },
    {
      value: CustomTaskStatus.UnderReview,
      label: 'قيد المراجعة',
      icon: 'bi bi-eye',
    },
    {
      value: CustomTaskStatus.NeedsEdits,
      label: 'تحتاج إلى تعديلات',
      icon: 'bi bi-pencil-fill',
    },
    {
      value: CustomTaskStatus.Completed,
      label: 'مكتمل',
      icon: 'bi bi-rocket-takeoff-fill',
    },
  ];
  CustomTaskStatus = CustomTaskStatus;

  constructor(
    private internalTaskService: InternalTaskService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    const taskId = Number(taskIdParam);

    this.internalTaskService.getById(taskId).subscribe({
      next: (task) => {
        this.internalTask = task;
      }
    });
  }

  updateTaskStatus(newStatus: CustomTaskStatus) {
    if (!this.internalTask) {
      return;
    }

    this.updatingStatus = true;

    this.internalTaskService.changeTaskStatus(this.internalTask.id, newStatus).subscribe({
      next: () => {
        if (this.internalTask) {
          this.internalTask.status = newStatus;
          if (newStatus === CustomTaskStatus.Completed) {
              this.internalTask.completedAt = new Date();
            } 
          this.updatingStatus = false;
        }
      },
      error: (err) => {
        this.updatingStatus = false;
        console.error('Error updating task status:', err);

      }
    });

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

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'عالي':
        return 'priority-high';
      case 'متوسط':
        return 'priority-medium';
      case 'عادي':
        return 'priority-normal';
      default:
        return 'priority-normal';
    }
  }

  isOverdue(): boolean {
    if (!this.internalTask) return false;
    return (
      new Date() > new Date(this.internalTask.deadline) &&
      this.internalTask.status !== CustomTaskStatus.Completed
    );
  }
}
