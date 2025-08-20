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
import {
  CustomTaskStatus,
  LightWieghtClient,
  TaskDTO,
} from '../../../model/client/client';

@Component({
  selector: 'app-employee-tasks',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './employee-tasks.component.html',
  styleUrl: './employee-tasks.component.css',
})
export class EmployeeTasksComponent implements OnInit {
  clients: LightWieghtClient[] = [];
  tasks: TaskDTO[] = [];
  filteredTasks: TaskDTO[] = [];
  filterForm!: FormGroup;

  constructor(
    private clientService: ClientService,
    private taskService: TaskService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      clientId: [null],
      priority: [null],
    });
  }

  ngOnInit(): void {
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
    this.taskService.getAll().subscribe({
      next: (response) => {
        this.tasks = response;
        this.filteredTasks = [...this.tasks];
      },
    });
  }

  getStatusText(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.NotStarted:
        return 'Not Started';
      case CustomTaskStatus.Delivered:
        return 'Delivered';
      case CustomTaskStatus.InProgress:
        return 'In Progress';
      case CustomTaskStatus.Completed:
        return 'Completed';
      default:
        return 'Unknown';
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
      if (clientId && task.clientId !== clientId) {
        matches = false;
      }

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
}
