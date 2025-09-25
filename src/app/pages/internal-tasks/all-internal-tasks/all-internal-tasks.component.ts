import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { EmployeeInternalTasksComponent } from "../employee-internal-tasks/employee-internal-tasks.component";
import { AdminInternalTasksComponent } from "../admin-internal-tasks/admin-internal-tasks.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap, tap } from 'rxjs';
import { InternalTask } from '../../../model/internal-task/internal-task';
import { InternalTaskService } from '../../../services/internal-tasks/internal-task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-internal-tasks',
  imports: [EmployeeInternalTasksComponent, AdminInternalTasksComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './all-internal-tasks.component.html',
  styleUrl: './all-internal-tasks.component.css',
})
export class AllInternalTasksComponent implements OnInit {
  isAdmin: boolean = false;
  isAccManager: boolean = false;
  currentUserId: string = '';

  searchControl = new FormControl();
results$!: Observable<InternalTask[]>;
  constructor(
    private authService: AuthService,
    private internalTaskService: InternalTaskService
  ) {}

  ngOnInit(): void {
    this.results$ = this.searchControl.valueChanges.pipe(
    debounceTime(2000),
    map(value => value?.trim() ?? ''),
    filter(value => value.length >= 3),
    distinctUntilChanged(),
    switchMap(query => this.internalTaskService.search(query))
  );
    this.currentUserId = this.authService.getCurrentUserId();
    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) {
        this.isAdmin = true;
      }
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) {
        this.isAccManager = true;
      }
    });
  }
}
