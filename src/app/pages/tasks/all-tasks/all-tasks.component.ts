import { Component, OnInit } from '@angular/core';
import { AdminTasksComponent } from '../admin-tasks/admin-tasks.component';
import { EmployeeTasksComponent } from '../employee-tasks/employee-tasks.component';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-all-tasks',
  imports: [AdminTasksComponent, EmployeeTasksComponent],
  templateUrl: './all-tasks.component.html',
  styleUrl: './all-tasks.component.css',
})
export class AllTasksComponent implements OnInit {
  isAdmin: boolean = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAdmin().subscribe((isAdminn) => {
      if (isAdminn) {
        this.isAdmin = true;
      }
    });
  }
}
