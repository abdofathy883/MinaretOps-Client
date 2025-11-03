import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { LightWieghtClient } from '../../../model/client/client';
import { ServicesService } from '../../../services/services/services.service';
import { ClientService } from '../../../services/clients/client.service';
import { ITask, TaskType, TaskFilter, PaginatedTaskResult, TASK_TEAM_MAPPINGS, CustomTaskStatus, ILightWieghtTask } from '../../../model/task/task';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/tasks/task.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';
import { ShimmerComponent } from "../../../shared/shimmer/shimmer.component";

@Component({
  selector: 'app-all-tasks',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ShimmerComponent, DatePipe, MapTaskStatusClassPipe, MapTaskStatusPipe],
  templateUrl: './all-tasks.component.html',
  styleUrl: './all-tasks.component.css',
})
export class AllTasksComponent implements OnInit {
  services: Service[] = [];
  employees: User[] = [];
  clients: LightWieghtClient[] = [];
  tasks: ILightWieghtTask[] = [];
  filteredTasks: ILightWieghtTask[] = [];
  searchQuery: string = '';
  searchResults: ILightWieghtTask[] = [];
  isSearching: boolean = false;
  filterForm!: FormGroup;
  currentUserId: string = '';
  isLoadingTasks: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 20;
  totalRecords: number = 0;
  totalPages: number = 0;
  loading: boolean = false;

  taskTeams = TASK_TEAM_MAPPINGS;

  constructor(
    private serviceService: ServicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private taskService: TaskService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      clientId: [null],
      employeeId: [null],
      priority: [null],
      fromDate: [null],
      toDate: [null],
      status: [null],
      onDeadline: [null],
      team: [null] // Add team to form
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    
    // Initialize form with today's date
    const today = new Date().toISOString().split('T')[0];
    this.filterForm.patchValue({
      fromDate: today,
      toDate: today
    });
    
    this.loadClients();
    this.loadEmployees();
    this.loadServices();
    this.loadTasks(); // This will now load today's tasks with pagination

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
    
    // Reset to today's date
    const today = new Date().toISOString().split('T')[0];
    this.filterForm.patchValue({
      clientId: null,
      employeeId: null,
      priority: null,
      fromDate: today,
      toDate: today,
      status: null,
      onDeadline: null,
      team: null // Reset team filter
    });
    
    this.currentPage = 1;
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.isLoadingTasks = true;
    
    const formValue = this.filterForm.value;
    
    // Create filter object for server-side pagination
    const filter: TaskFilter = {
      fromDate: formValue.fromDate || undefined,
      toDate: formValue.toDate || undefined,
      employeeId: formValue.employeeId || undefined,
      clientId: formValue.clientId || undefined,
      status: formValue.status || undefined,
      priority: formValue.priority || undefined,
      onDeadline: formValue.onDeadline || undefined,
      team: formValue.team || undefined, // Add team to filter
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.taskService.getPaginatedTasks(filter, this.currentUserId).subscribe({
      next: (response: PaginatedTaskResult) => {
        this.tasks = response.records;
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.filteredTasks = [...this.tasks];
        this.loading = false;
        this.isLoadingTasks = false;
      },
      error: (error) => {
        this.loading = false;
        this.isLoadingTasks = false;
      }
    });
  }

  // Add day navigation methods
  loadPreviousDay(): void {
    const fromDate = new Date(this.filterForm.value.fromDate);
    fromDate.setDate(fromDate.getDate() - 1);
    
    const toDate = new Date(this.filterForm.value.toDate);
    toDate.setDate(toDate.getDate() - 1);

    this.filterForm.patchValue({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    });

    this.currentPage = 1; // Reset to first page
    this.loadTasks();
  }

  loadNextDay(): void {
    const fromDate = new Date(this.filterForm.value.fromDate);
    fromDate.setDate(fromDate.getDate() + 1);
    
    const toDate = new Date(this.filterForm.value.toDate);
    toDate.setDate(toDate.getDate() + 1);

    this.filterForm.patchValue({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    });

    this.currentPage = 1; // Reset to first page
    this.loadTasks();
  }

  // Add pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadTasks();
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

  isCompletedAfterDeadline(task: ILightWieghtTask): boolean {
  return task.status === CustomTaskStatus.Completed &&
         task.completedAt != null &&
         new Date(task.completedAt) > new Date(task.deadline);
}
}
