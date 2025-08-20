import { Component, OnInit } from '@angular/core';
import { CustomTaskStatus, TaskDTO } from '../../../model/client/client';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-single-task',
  imports: [CommonModule],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.css'
})
export class SingleTaskComponent implements OnInit{
  task!: TaskDTO;
  updatingStatus = false;
  availableStatuses = [
    { value: CustomTaskStatus.NotStarted, label: 'لم تبدأ', icon: 'fas fa-clock' },
    { value: CustomTaskStatus.InProgress, label: 'قيد التنفيذ', icon: 'fas fa-play-circle' },
    { value: CustomTaskStatus.Delivered, label: 'تم التسليم', icon: 'fas fa-paper-plane' },
    { value: CustomTaskStatus.Completed, label: 'مكتمل', icon: 'fas fa-check-circle' }
  ];
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
      case CustomTaskStatus.NotStarted: return 'لم تبدأ';
      case CustomTaskStatus.Delivered: return 'تم التسليم';
      case CustomTaskStatus.InProgress: return 'قيد التنفيذ';
      case CustomTaskStatus.Completed: return 'مكتمل';
      default: return 'غير محدد';
    }
  }

  getStatusClass(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.NotStarted: return 'status-not-started';
      case CustomTaskStatus.Delivered: return 'status-delivered';
      case CustomTaskStatus.InProgress: return 'status-in-progress';
      case CustomTaskStatus.Completed: return 'status-completed';
      default: return 'status-unknown';
    }
  }

  updateTaskStatus(newStatus: CustomTaskStatus): void {
    if (!this.task) return;

    this.updatingStatus = true;

    const updateData = {
      status: newStatus,
      completedAt: newStatus === CustomTaskStatus.Completed ? new Date() : undefined
    };

    this.taskService.update(this.task.id, updateData).subscribe({
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
