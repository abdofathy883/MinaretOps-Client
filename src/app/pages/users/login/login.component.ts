import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginUser } from '../../../model/auth/user';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  returnUrl: string = '/users/my-account';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/users/my-account';
    this.loginForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.isLoading = false;
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const user: LoginUser = {
      phoneNumber: this.loginForm.value.phoneNumber,
      password: this.loginForm.value.password,
    };
    this.authService.login(user).subscribe({
      next: (res) => {
        let targetUrl = this.returnUrl.includes(':id')
          ? this.returnUrl.replace(':id', res.id)
          : this.returnUrl;

        // Fallback: if someone passed '/users/my-account' without id
        if (
          targetUrl === '/users/my-account' ||
          targetUrl === '/users/my-account/'
        ) {
          targetUrl = `/users/my-account/${res.id}`;
        }

        this.isLoading = false;
        this.router.navigateByUrl(targetUrl);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      },
    });
  }
}
