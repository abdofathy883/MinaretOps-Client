import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomTaskStatus, ITask } from '../../../model/task/task';

@Component({
  selector: 'app-single-task',
  imports: [CommonModule],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.css'
})
export class SingleTaskComponent implements OnInit{
  task!: ITask;
  updatingStatus = false;
  availableStatuses = [
    { value: CustomTaskStatus.Open, label: 'لم تبدأ', icon: 'bi bi-clock' },
    { value: CustomTaskStatus.Acknowledged, label: 'تم الإقرار', icon: 'bi bi-hand-thumbs-up' },
    { value: CustomTaskStatus.InProgress, label: 'قيد التنفيذ', icon: 'bi bi-play-circle' },
    { value: CustomTaskStatus.UnderReview, label: 'قيد المراجعة', icon: 'bi bi-eye' },
    { value: CustomTaskStatus.NeedsEdits, label: 'تحتاج إلى تعديلات', icon: 'bi bi-pencil-fill' },
    { value: CustomTaskStatus.Completed, label: 'مكتمل', icon: 'bi bi-rocket-takeoff-fill' }
  ];
  CustomTaskStatus = CustomTaskStatus;
  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    const taskId = Number(taskIdParam);
    this.taskService.getById(taskId).subscribe({
      next: (response) => {
        this.task = response;
        console.log(response)
      }
    })
  }

  getStatusLabel(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open: return 'لم تبدأ';
      case CustomTaskStatus.Acknowledged: return 'تم الإقرار';
      case CustomTaskStatus.InProgress: return 'قيد التنفيذ';
      case CustomTaskStatus.UnderReview: return 'قيد المراجعة';
      case CustomTaskStatus.NeedsEdits: return 'تحتاج إلى تعديلات';
      case CustomTaskStatus.Completed: return 'مكتمل';
      default: return 'غير محدد';
    }
  }

  getStatusClass(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open: return 'status-not-started';
      case CustomTaskStatus.Acknowledged: return 'status-acknowledged';
      case CustomTaskStatus.InProgress: return 'status-in-progress';
      case CustomTaskStatus.UnderReview: return 'status-under-review';
      case CustomTaskStatus.NeedsEdits: return 'status-needs-edits';
      case CustomTaskStatus.Completed: return 'status-completed';
      default: return 'status-unknown';
    }
  }

  updateTaskStatus(newStatus: CustomTaskStatus): void {
    if (!this.task) return;

    this.updatingStatus = true;

    this.taskService.changeStatus(this.task.id, newStatus).subscribe({
      next: () => {
        if (this.task) {
          this.task.status = newStatus;
          
          // Update CompletedAt field
          if (newStatus === CustomTaskStatus.Completed) {
            this.task.completedAt = new Date();
          } else {
            this.task.completedAt = undefined;
          }
        }
        this.updatingStatus = false;
      },
      error: (err) => {
        this.updatingStatus = false;
        console.error('Error updating task status:', err);
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'عالي': return 'priority-high';
      case 'متوسط': return 'priority-medium';
      case 'عادي': return 'priority-normal';
      default: return 'priority-normal';
    }
  }

  isOverdue(): boolean {
    if (!this.task) return false;
    return new Date() > new Date(this.task.deadline) && this.task.status !== CustomTaskStatus.Completed;
  }
}
