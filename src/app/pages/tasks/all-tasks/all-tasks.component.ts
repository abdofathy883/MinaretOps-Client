import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { LightWieghtClient } from '../../../model/client/client';
import { ServicesService } from '../../../services/services/services.service';
import { ClientService } from '../../../services/clients/client.service';
import { ITask, TaskType } from '../../../model/task/task';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/tasks/task.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';

@Component({
  selector: 'app-all-tasks',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MapTaskStatusClassPipe, MapTaskStatusPipe],
  templateUrl: './all-tasks.component.html',
  styleUrl: './all-tasks.component.css',
})
export class AllTasksComponent implements OnInit {
  services: Service[] = [];
  employees: User[] = [];
  clients: LightWieghtClient[] = [];
  tasks: ITask[] = [];
  filteredTasks: ITask[] = [];
  searchQuery: string = '';
  searchResults: ITask[] = [];
  isSearching: boolean = false;
  filterForm!: FormGroup;
  currentUserId: string = '';

  constructor(
    private serviceService: ServicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private taskService: TaskService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      serviceId: [null],
      clientId: [null],
      employeeId: [null],
      priority: [null],
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadClients();
    this.loadEmployees();
    this.loadServices();
    this.loadTasks();

    // Subscribe to form changes for live filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
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

  onSearchInput() {
    if (this.searchQuery.trim().length >= 0) {
      this.performSearch();
    } else if (this.searchQuery.trim().length === 0) {
      this.clearSearch();
    }
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.clearSearch();
      return;
    }

    this.isSearching = true;
    this.taskService.searchTasks(this.searchQuery.trim(), this.currentUserId).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.filteredTasks = [...this.searchResults];
        this.isSearching = false;
      },
      error: (error) => {
        this.isSearching = false;
      },
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearching = false;
    this.filteredTasks = [...this.tasks];
    this.filterForm.patchValue({
    serviceId: null,
    clientId: null,
    employeeId: null,
    priority: null
  });
  this.filteredTasks = [...this.tasks];
  }

  loadTasks() {
    this.taskService.getTasksByEmployee(this.currentUserId).subscribe({
      next: (response) => {
        this.tasks = response;
        this.filteredTasks = [...this.tasks];
        this.applyFilters(); // Apply initial filters
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
    const serviceId = formValues.serviceId
      ? Number(formValues.serviceId)
      : null;
    const clientId = formValues.clientId ? Number(formValues.clientId) : null;
    const employeeId = formValues.employeeId;
    const priority = formValues.priority;

    // Use search results if searching, otherwise use original tasks
    const tasksToFilter = this.isSearching ? this.searchResults : this.tasks;

    this.filteredTasks = tasksToFilter.filter((task) => {
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
