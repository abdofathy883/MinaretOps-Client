import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { TaskService } from '../../../services/tasks/task.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { LightWieghtClient } from '../../../model/client/client';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { CustomTaskStatus, ITask, TaskType } from '../../../model/task/task';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';

@Component({
  selector: 'app-employee-tasks',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MapTaskStatusClassPipe,
    MapTaskStatusPipe,
  ],
  templateUrl: './employee-tasks.component.html',
  styleUrl: './employee-tasks.component.css',
})
export class EmployeeTasksComponent implements OnInit {
  clients: LightWieghtClient[] = [];
  tasks: ITask[] = [];
  filteredTasks: ITask[] = [];
  filterForm!: FormGroup;
  employeeId: string = '';

  constructor(
    private clientService: ClientService,
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      clientId: [null],
      priority: [null],
    });
  }

  ngOnInit(): void {
    this.employeeId = this.authService.getCurrentUserId();
    this.loadClients();
    this.loadTasks();
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response;
      },
    });
  }

  loadTasks() {
    this.taskService.getTasksByEmployee(this.employeeId).subscribe({
      next: (response) => {
        this.tasks = response.reverse();
        this.filteredTasks = [...this.tasks];
      },
    });
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

  applyFilters() {
    const formValues = this.filterForm.value;

    // Convert string IDs to numbers
    const clientId = formValues.clientId ? Number(formValues.clientId) : null;
    const priority = formValues.priority;

    this.filteredTasks = this.tasks.filter((task) => {
      let matches = true;

      // Filter by client ID
      // if (clientId && task.clientId !== clientId) {
      //   matches = false;
      // }

      // Filter by priority
      if (priority && task.priority !== priority) {
        matches = false;
      }

      return matches;
    });
  }

  goToTask(taskId: number) {
    this.router.navigate(['tasks', taskId]);
  }

  getTypeLabel(type: TaskType): string {
    switch (type) {
      case TaskType.Ad_Management:
        return 'Ad Management';
      case TaskType.Backend:
        return 'Backend';
      case TaskType.ContentStrategy:
        return 'Content Strategy';
      case TaskType.ContentWriting:
        return 'Content Writing';
      case TaskType.DesignDirections:
        return 'Design Directions';
      case TaskType.E_mailMarketing:
        return 'E-mail Marketing';
      case TaskType.Frontend:
        return 'Frontend';
      case TaskType.HostingManagement:
        return 'Hosting Management';
      case TaskType.Illustrations:
        return 'Illustrations';
      case TaskType.LogoDesign:
        return 'Logo Design';
      case TaskType.Meeting:
        return 'Meeting';
      case TaskType.Moderation:
        return 'Moderation';
      case TaskType.Motion:
        return 'Motion';
      case TaskType.Planning:
        return 'Planning';
      case TaskType.PrintingsDesign:
        return 'Printings Design';
      case TaskType.Publishing:
        return 'Publishing';
      case TaskType.SEO:
        return 'SEO';
      case TaskType.SM_Design:
        return 'SM Design';
      case TaskType.UI_UX:
        return 'UI/UX';
      case TaskType.VideoEditing:
        return 'Video Editing';
      case TaskType.VisualIdentity:
        return 'Visual Identity';
      case TaskType.Voiceover:
        return 'Voiceover';
      case TaskType.WhatsAppMarketing:
        return 'WhatsApp Marketing';
      case TaskType.WordPress:
        return 'WordPress';
      default:
        return 'غير محدد';
    }
  }
}
