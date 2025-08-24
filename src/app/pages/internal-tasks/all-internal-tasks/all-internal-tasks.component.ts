import { Component, OnInit } from '@angular/core';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { InternalTask } from '../../../model/internal-task/internal-task';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-internal-tasks',
  imports: [],
  templateUrl: './all-internal-tasks.component.html',
  styleUrl: './all-internal-tasks.component.css'
})
export class AllInternalTasksComponent implements OnInit{
  internalTasks: InternalTask[] = [];

  constructor(
    private internalTaskService: InternalTaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInternalTasks();
  }

  loadInternalTasks() {
    this.internalTaskService.getAll().subscribe({
      next: (response) => {
        this.internalTasks = response;
      },
      error: (error) => {
        console.error('Error loading internal tasks:', error);
      }
    });
  }

  goToTask (id: number) {
    this.router.navigate(['/internal-tasks', id]);
  }
}
