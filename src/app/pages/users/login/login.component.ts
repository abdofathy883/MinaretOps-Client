import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginUser } from '../../../model/auth/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  isLoading: boolean = false;
  loginForm!: FormGroup;
  errorMessage: string = '';
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required]
    })
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
      password: this.loginForm.value.password
    }
    this.authService.login(user).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/users/my-account', res.id]);
      },
      error: (error) => {
        this.isLoading = false;
        console.log('error', error);
        this.errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      }
    })
  }
}
