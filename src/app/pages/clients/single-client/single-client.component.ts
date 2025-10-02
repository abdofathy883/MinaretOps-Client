import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { TaskService } from '../../../services/tasks/task.service';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../model/auth/user';
import { ClientInfoComponent } from '../client-mini-components/client-info/client-info.component';
import { TaskGroupsComponent } from "../client-mini-components/task-groups/task-groups.component";
import { IClient } from '../../../model/client/client';
import { ICreateTask, ICreateTaskGroup, ITask } from '../../../model/task/task';
import { AlertService } from '../../../services/helper-services/alert.service';

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
  client: IClient | null = null;
  employees: User[] = [];
  loading = false;

  alertMessage = '';
  alertType = 'info';

  // Modal states
  showAddTaskModal = false;
  showAddTaskGroupModal = false;
  showEditTaskModal = false;
  selectedClientServiceId: number | null = null;
  selectedTaskGroupId: number | null = null;
  selectedTask: ITask | null = null;
  currentUserId: string = '';

  constructor(
    private clientService: ClientService,
    private taskService: TaskService,
    private authService: AuthService,
    private alertService: AlertService,
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

    this.currentUserId = this.authService.getCurrentUserId();
  }

  loadClient(): void {
    const clientIdParam = this.route.snapshot.paramMap.get('id');
    const clientId = Number(clientIdParam);

    if (clientId) {
      this.loading = true;
      this.clientService.getById(clientId).subscribe({
        next: (response) => {
          this.client = response;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showAlert('حدث خطا في تحميل بيانات العميل', 'error');
        },
      });
    }
  }

  // Client info updated
  // onClientUpdated(updatedClient: IClient): void {
  //   this.client = updatedClient;
  //   this.successMessage = 'تم تحديث بيانات العميل بنجاح';
  //   this.clearMessages();
  // }

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

  openEditTaskModal(task: ITask): void {
    this.selectedTask = task;
    this.showEditTaskModal = true;
  }

  onTaskCreated(createTask: ICreateTask): void {
    this.loading = true;

    this.taskService.addTask(createTask).subscribe({
      next: (response) => {
        // Add the new task to local data
        this.addTaskToLocalData(response);
        this.showAlert('تم اضافة التاسك بنجاح', 'success');
        this.closeAddTaskModal();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showAlert('حدث خطا في اضافة المهمة', 'error');
      },
    });
  }

  onTaskGroupCreated(createTaskGroup: ICreateTaskGroup): void {
    this.loading = true;

    this.taskService.addTaskGroup(createTaskGroup).subscribe({
      next: (response) => {
        // Add the new task group to local data
        this.addTaskGroupToLocalData(response);
        this.loading = false;
        this.showAlert('تم انشاء مجموعة التاسكات بنجاح', 'erroer');
        this.closeAddTaskGroupModal();
      },
      error: () => {
        this.loading = false;
        this.showAlert('حدث خطا في انشاء مجموعة التاسكات', 'error');
      },
    });
  }

  // Task updated from child components
  onTaskUpdated(taskData: ITask): void {
    this.loading = true;

    this.taskService.update(taskData.id, this.currentUserId, taskData).subscribe({
      next: (response) => {
        // Update the task in local data
        this.updateTaskInLocalData(response);
        this.loading = false;
        this.showAlert('تم تحديث التاسك بنجاح', 'success');
        this.closeEditTaskModal();
      },
      error: (error) => {
        this.loading = false;
        this.showAlert('حدث خطا في تحديث التاسك', 'error');
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

  private updateTaskInLocalData(updatedTask: ITask): void {
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

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert() {
    this.alertMessage = '';
  }
}
