import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceComponent } from '../../attendance/attendance.component';
import { SubmitLeaveRequestComponent } from '../../leave-requests/submit-leave-request/submit-leave-request.component';
import { MyKpisManagementComponent } from '../../kpis/my-kpis-management/my-kpis-management.component';
import { RequestByEmployeeComponent } from '../../leave-requests/request-by-employee/request-by-employee.component';
import { UpdateProfileComponent } from '../update-profile/update-profile.component';
import { MyAccountShimmerComponent } from '../../../shared/my-account-shimmer/my-account-shimmer.component';
import { JdForEmpComponent } from "../../jds/jd-for-emp/jd-for-emp.component";
@Component({
  selector: 'app-my-account',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AttendanceComponent,
    SubmitLeaveRequestComponent,
    MyKpisManagementComponent,
    RequestByEmployeeComponent,
    UpdateProfileComponent,
    MyAccountShimmerComponent,
    JdForEmpComponent
],
  standalone: true,
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})
export class MyAccountComponent implements OnInit {
  currentUser!: User;
  loadingUser: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadingUser = true;
    const userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.authService.getById(userId).subscribe({
      next: (response) => {
        this.currentUser = response;
        this.loadingUser = false;
      },
    });
  }

  logout() {
    this.authService.LogOut();
  }

  // private passwordComplexityValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const value: string = control.value || '';
  //     if (!value) return null; // handled by required

  //     const hasUpper = /[A-Z]/.test(value);
  //     const hasLower = /[a-z]/.test(value);
  //     const hasSpecial = /[^A-Za-z0-9]/.test(value);

  //     return hasUpper && hasLower && hasSpecial
  //       ? null
  //       : { passwordComplexity: true };
  //   };
  // }
}
