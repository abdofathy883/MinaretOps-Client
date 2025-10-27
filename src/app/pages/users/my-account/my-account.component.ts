import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MyAccountShimmerComponent } from '../../../shared/my-account-shimmer/my-account-shimmer.component';
@Component({
  selector: 'app-my-account',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MyAccountShimmerComponent,
    RouterOutlet,
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
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadingUser = true;
    const userId = this.route.snapshot.paramMap.get('id') ?? '';

    this.route.firstChild ??
      this.router.navigate(['attendance', userId], { relativeTo: this.route });
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
}
