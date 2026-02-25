import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Service } from '../../../model/service/service';
import { User } from '../../../model/auth/user';
import { LightWieghtClient } from '../../../model/client/client';
import { ServicesService } from '../../../services/services/services.service';
import { ClientService } from '../../../services/clients/client.service';
import {
  ITask,
  TaskType,
  TaskFilter,
  PaginatedTaskResult,
  TASK_TEAM_MAPPINGS,
  CustomTaskStatus,
  ILightWieghtTask,
} from '../../../model/task/task';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TaskService } from '../../../services/tasks/task.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MapTaskStatusClassPipe } from '../../../core/pipes/map-task-status-class/map-task-status-class.pipe';
import { MapTaskStatusPipe } from '../../../core/pipes/map-task-status/map-task-status.pipe';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';
import { MapTaskPriorityPipe } from '../../../core/pipes/task-priority/map-task-priority.pipe';
import { MapTaskTypePipe } from '../../../core/pipes/task-type/map-task-type.pipe';

@Component({
  selector: 'app-all-tasks',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ShimmerComponent,
    DatePipe,
    MapTaskStatusClassPipe,
    MapTaskStatusPipe,
    MapTaskPriorityPipe,
    MapTaskTypePipe,
  ],
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
  isLoadingTasks: boolean = false;
  isShowingFilters: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 20;
  totalRecords: number = 0;
  totalPages: number = 0;
  loading: boolean = false;

  taskTeams = TASK_TEAM_MAPPINGS;

  /** View mode: grid with 2 cols, grid with 3 cols, or list (1 col) */
  viewMode: 'grid2' | 'grid3' | 'list' = 'grid3';

  setViewMode(mode: 'grid2' | 'grid3' | 'list') {
    this.viewMode = mode;
  }

  constructor(
    private serviceService: ServicesService,
    private authService: AuthService,
    private clientService: ClientService,
    private taskService: TaskService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      clientId: [null],
      employeeId: [null],
      priority: [null],
      fromDate: [null],
      toDate: [null],
      status: [null],
      onDeadline: [null],
      team: [null], // Add team to form
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadEmployees();
    this.loadServices();
    this.loadTasks();

    // Subscribe to form changes for live filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  toggleFilters(){
    this.isShowingFilters = !this.isShowingFilters;
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
    this.taskService.searchTasks(this.searchQuery.trim()).subscribe({
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

    // Reset to first day of current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    this.filterForm.patchValue({
      clientId: null,
      employeeId: null,
      priority: null,
      fromDate: firstDayStr,
      toDate: todayStr,
      status: null,
      onDeadline: null,
      team: null,
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
      pageSize: this.pageSize,
    };

    this.taskService.getPaginatedTasks(filter).subscribe({
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
      },
    });
  }

  // Day navigation: reference is current form date, or today when empty
  loadPreviousDay(): void {
    const ref = this.filterForm.value.fromDate
      ? new Date(this.filterForm.value.fromDate)
      : new Date();
    ref.setDate(ref.getDate() - 1);
    const dayStr = ref.toISOString().split('T')[0];
    this.filterForm.patchValue({ fromDate: dayStr, toDate: dayStr });
    this.currentPage = 1;
    this.loadTasks();
  }

  loadNextDay(): void {
    const ref = this.filterForm.value.fromDate
      ? new Date(this.filterForm.value.fromDate)
      : new Date();
    ref.setDate(ref.getDate() + 1);
    const dayStr = ref.toISOString().split('T')[0];
    this.filterForm.patchValue({ fromDate: dayStr, toDate: dayStr });
    this.currentPage = 1;
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

  goToTask(taskId: number) {
    this.router.navigate(['tasks', taskId]);
  }

  isCompletedAfterDeadline(task: ILightWieghtTask): boolean {
    return (
      task.status === CustomTaskStatus.Completed &&
      task.completedAt != null &&
      new Date(task.completedAt) > new Date(task.deadline)
    );
  }

  getShortDescription(html: string): string {
    const text = html.replace(/<[^>]*>/g, ''); // strip HTML tags
    return text.length > 50 ? text.slice(0, 50) + '…' : text;
  }
}
