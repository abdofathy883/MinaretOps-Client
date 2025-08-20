import { Component, OnInit } from '@angular/core';
import { Service } from '../../../model/service/service';
import { ServicesService } from '../../../services/services/services.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import {
  CustomTaskStatus,
  LightWieghtClient,
  TaskDTO,
} from '../../../model/client/client';
import { ClientService } from '../../../services/clients/client.service';
import { TaskService } from '../../../services/tasks/task.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-admin-tasks',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './admin-tasks.component.html',
  styleUrl: './admin-tasks.component.css',
})
export class AdminTasksComponent implements OnInit {
  services: Service[] = [];
  employees: User[] = [];
  clients: LightWieghtClient[] = [];
  tasks: TaskDTO[] = [];
  filteredTasks: TaskDTO[] = [];
  filterForm!: FormGroup;

  constructor(
    private serviceService: ServicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private taskService: TaskService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      serviceId: [],
      clientId: [null],
      employeeId: [null],
      priority: [null],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadEmployees();
    this.loadServices();
    this.loadTasks();
  }

  loadServices() {
    this.serviceService.getAll().subscribe({
      next: (response) => {
        this.services = response;
      },
    });
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response;
      },
    });
  }

  loadEmployees() {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
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
    const serviceId = formValues.serviceId
      ? Number(formValues.serviceId)
      : null;
    const clientId = formValues.clientId ? Number(formValues.clientId) : null;
    const employeeId = formValues.employeeId;
    const priority = formValues.priority;

    this.filteredTasks = this.tasks.filter((task) => {
      let matches = true;

      // Filter by service ID
      if (serviceId && task.serviceId !== serviceId) {
        matches = false;
      }

      // Filter by client ID
      if (clientId && task.clientId !== clientId) {
        matches = false;
      }

      // Filter by employee ID
      if (employeeId && task.employeeId !== employeeId) {
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
