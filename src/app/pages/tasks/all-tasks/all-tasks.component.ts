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
import { ShimmerComponent } from "../../../shared/shimmer/shimmer.component";

@Component({
  selector: 'app-all-tasks',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MapTaskStatusClassPipe, MapTaskStatusPipe, ShimmerComponent],
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
  isLoadingTasks: boolean = false;

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
      fromDate: [null],     // Add this
    toDate: [null],       // Add this
    status: [null],        // Add this
    onDeadline: [null]
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
    clientId: null,
    employeeId: null,
    priority: null,
    fromDate: null,
    toDate: null,
    status: null,
    onDeadline: [null]
  });
  this.filteredTasks = [...this.tasks];
  }

  loadTasks() {
    this.isLoadingTasks = true;
    this.taskService.getTasksByEmployee(this.currentUserId).subscribe({
      next: (response) => {
        console.log(response)
        this.isLoadingTasks = false;
        this.tasks = response.reverse();
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

    const clientId = formValues.clientId ? Number(formValues.clientId) : null;
    const employeeId = formValues.employeeId;
    const priority = formValues.priority;
    const fromDate = formValues.fromDate;
  const toDate = formValues.toDate;
  const status = formValues.status;
  const onDeadline = formValues.onDeadline;

    // Use search results if searching, otherwise use original tasks
    const tasksToFilter = this.isSearching ? this.searchResults : this.tasks;

    this.filteredTasks = tasksToFilter.filter((task) => {
      let matches = true;



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

      // Filter by status
    if (status !== null && status !== '' && task.status !== Number(status)) {
      matches = false;
    }

    // Filter by date range
    if (fromDate || toDate) {
      const taskDate = new Date(task.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && taskDate < from) {
        matches = false;
      }
      if (to && taskDate > to) {
        matches = false;
      }
    }

    // if (onDeadline !== null && onDeadline !== '') {
    //   const isCompletedOnDeadline = task.isCompletedOnDeadline;
    //   const filterValue = onDeadline === 'true';
      
    //   if (isCompletedOnDeadline !== filterValue) {
    //     matches = false;
    //   }
    // }

    if (onDeadline !== null && onDeadline !== '') {
      const currentDate = new Date();
      const taskDeadline = new Date(task.deadline);
      
      // Three states: yes, no, not-yet
      if (onDeadline === 'yes') {
        // Task completed on deadline: must have completedAt AND isCompletedOnDeadline = true
        if (!task.completedAt || !task.isCompletedOnDeadline) {
          matches = false;
        }
      } else if (onDeadline === 'no') {
        // Task completed late OR deadline passed but not completed
        // Completed late: has completedAt AND isCompletedOnDeadline = false
        // Deadline passed: no completedAt AND current date >= deadline
        const isCompletedLate = task.completedAt && !task.isCompletedOnDeadline;
        const isDeadlinePassed = !task.completedAt && currentDate >= taskDeadline;
        
        if (!isCompletedLate && !isDeadlinePassed) {
          matches = false;
        }
      } else if (onDeadline === 'not-yet') {
        // Task not completed and deadline hasn't arrived yet
        if (task.completedAt || currentDate >= taskDeadline) {
          matches = false;
        }
      }
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
