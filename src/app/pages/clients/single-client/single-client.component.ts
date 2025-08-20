import { ClientServiceDTO } from './../../../model/client/client';
import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ClientDTO,
  CreateTaskDTO,
  CreateTaskGroupDTO,
  TaskDTO,
} from '../../../model/client/client';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import { ClientInfoComponent } from '../client-mini-components/client-info/client-info.component';
import { TaskGroupsComponent } from "../client-mini-components/task-groups/task-groups.component";

@Component({
  selector: 'app-single-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClientInfoComponent,
    TaskGroupsComponent
],
  templateUrl: './single-client.component.html',
  styleUrl: './single-client.component.css',
})
export class SingleClientComponent implements OnInit {
  client: ClientDTO | null = null
  // client: ClientDTO = {
  //   id: 0,
  //   name: '',
  //   personalPhoneNumber: '',
  //   companyName: '',
  //   companyNumber: '',
  //   businessDescription: '',
  //   status: 0,
  //   createdAt: new Date,
  //   clientServices: ''
  // };
  employees: User[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  loading = false;

  // Modal states
  showAddTaskModal = false;
  showAddTaskGroupModal = false;
  showEditTaskModal = false;
  selectedClientServiceId: number | null = null;
  selectedTaskGroupId: number | null = null;
  selectedTask: TaskDTO | null = null;

  constructor(
    private clientService: ClientService,
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadClient();
    this.loadEmployees();
  }

  loadEmployees() {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      },
    });
  }

  private loadClient(): void {
    const clientIdParam = this.route.snapshot.paramMap.get('id');
    const clientId = Number(clientIdParam);

    if (clientId) {
      this.loading = true;
      this.clientService.getById(clientId).subscribe({
        next: (response) => {
          this.client = response;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'حدث خطأ في تحميل بيانات العميل';
          this.loading = false;
        },
      });
    }
  }

  // Client info updated
  onClientUpdated(updatedClient: ClientDTO): void {
    this.client = updatedClient;
    this.successMessage = 'تم تحديث بيانات العميل بنجاح';
    this.clearMessages();
  }

  // Task management
  openAddTaskModal(clientServiceId: number, taskGroupId: number): void {
    this.selectedClientServiceId = clientServiceId;
    this.selectedTaskGroupId = taskGroupId;
    this.showAddTaskModal = true;
  }

  openAddTaskGroupModal(clientServiceId: number): void {
    this.selectedClientServiceId = clientServiceId;
    this.showAddTaskGroupModal = true;
  }

  openEditTaskModal(task: TaskDTO): void {
    this.selectedTask = task;
    this.showEditTaskModal = true;
  }

  onTaskCreated(createTask: CreateTaskDTO): void {
    this.loading = true;

    this.taskService.createTask(createTask).subscribe({
      next: (response) => {
        // Add the new task to local data
        this.addTaskToLocalData(response);
        this.successMessage = 'تم إضافة المهمة بنجاح';
        this.closeAddTaskModal();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'حدث خطأ في إضافة المهمة';
        this.loading = false;
      },
    });
  }

  onTaskGroupCreated(createTaskGroup: CreateTaskGroupDTO): void {
    this.loading = true;

    this.taskService.createTaskGroup(createTaskGroup).subscribe({
      next: (response) => {
        // Add the new task group to local data
        this.addTaskGroupToLocalData(response);
        this.successMessage = 'تم إنشاء مجموعة المهام بنجاح';
        this.closeAddTaskGroupModal();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'حدث خطأ في إنشاء مجموعة المهام';
        this.loading = false;
      },
    });
  }

  // Task updated from child components
  onTaskUpdated(taskData: TaskDTO): void {
    this.loading = true;

    this.taskService.update(taskData.id, taskData).subscribe({
      next: (response) => {
        // Update the task in local data
        this.updateTaskInLocalData(response);
        this.successMessage = 'تم تحديث المهمة بنجاح';
        this.closeEditTaskModal();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'حدث خطأ في تحديث المهمة';
        this.loading = false;
      },
    });
  }

  // Helper methods
  private addTaskToLocalData(newTask: any): void {
    if (this.client) {
      this.client.clientServices.forEach((service) => {
        service.taskGroups.forEach((group) => {
          if (group.id === this.selectedTaskGroupId) {
            group.tasks.push(newTask);
          }
        });
      });
    }
  }

  private addTaskGroupToLocalData(newTaskGroup: any): void {
    if (this.client) {
      this.client.clientServices.forEach((service) => {
        if (service.id === this.selectedClientServiceId) {
          service.taskGroups.push(newTaskGroup);
        }
      });
    }
  }

  private updateTaskInLocalData(updatedTask: TaskDTO): void {
    if (this.client) {
      this.client.clientServices.forEach((service) => {
        service.taskGroups.forEach((group) => {
          const taskIndex = group.tasks.findIndex(task => task.id === updatedTask.id);
          if (taskIndex !== -1) {
            group.tasks[taskIndex] = updatedTask;
          }
        });
      });
    }
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal = false;
    this.selectedClientServiceId = null;
    this.selectedTaskGroupId = null;
  }

  closeAddTaskGroupModal(): void {
    this.showAddTaskGroupModal = false;
    this.selectedClientServiceId = null;
  }

  closeEditTaskModal(): void {
    this.showEditTaskModal = false;
    this.selectedTask = null;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
