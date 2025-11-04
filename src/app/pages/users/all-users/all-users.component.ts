import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { MapUserRolePipe } from '../../../core/pipes/map-user-role/map-user-role.pipe';
import { ShimmerComponent } from "../../../shared/shimmer/shimmer.component";

@Component({
  selector: 'app-all-users',
  imports: [MapUserRolePipe, ShimmerComponent],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css',
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  isLoadingUsers: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoadingUsers = true;
    this.authService.getAll().subscribe({
      next: (response) => {
        this.isLoadingUsers = false;
        this.users = response;
      }
    });
  }

  goToUser(userId: string) {
    this.router.navigate(['/users', userId]);
  }
}
