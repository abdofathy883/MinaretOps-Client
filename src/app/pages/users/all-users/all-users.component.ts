import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-all-users',
  imports: [],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent implements OnInit{
  users: User[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.users = response;
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  goToUser(userId: string) {
    this.router.navigate(['/users', userId]);
  }
}
