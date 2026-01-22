import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { ChangePassword, IResetPassword, LoginUser, RegisterUser, TokenPayload, UpdateUser, User } from '../../model/auth/user';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private endpoint = 'auth';
  private readonly tokenKey = 'auth_token';
  private readonly userIdKey = 'user_Id';
  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.initializeAuthState();
   }

  private currentUserSubject = new BehaviorSubject<User | null>(null);
    public readonly currentUser$ = this.currentUserSubject.asObservable();

    private loggedInSubject = new BehaviorSubject<boolean>(false);
    public readonly isLoggedIn$ = this.loggedInSubject.asObservable();

    private initializeAuthState(): void {
    const token = this.getStoredToken();
    const userId = this.getStoredUserId();
    
    if (token && userId && this.isTokenValid(token)) {
      this.loggedInSubject.next(true);
    } else {
      this.clearAuthState();
    }
  }

  hasRole(role: string): Observable<boolean> {
    const userId = this.getCurrentUserId();
  if (!userId) {
    return new Observable(observer => observer.next(false));
  }
  
  return this.getById(userId).pipe(
    map(user => user.roles.includes(role)),
    catchError(() => new Observable<boolean>(observer => observer.next(false)))
  );
  }

  isAdmin(): Observable<boolean> {
    return this.hasRole('Admin');
  }

  isAccountManager(): Observable<boolean> {
    return this.hasRole('AccountManager');
  }

  isDesignerLeader(): Observable<boolean> {
    return this.hasRole('GraphicDesignerTeamLeader')
  }

  isContentLeader(): Observable<boolean> {
    return this.hasRole('ContentCreatorTeamLeader')
  }

  isFinance(): Observable<boolean> {
    return this.hasRole('Finance')
  }

  login(user: LoginUser): Observable<User> {
    return this.api.post<User>(`${this.endpoint}/login`, user)
    .pipe(
      tap(response => this.handleSuccessfulAuth(response)),
      catchError(this.handleError)
    )
  }

  registerUser(user: RegisterUser) {
    return this.api.post(`${this.endpoint}/register`, user)
    .pipe(
      catchError(this.handleError)
    )
  }

  getAll(): Observable<User[]>{
    return this.api.get<User[]>(`${this.endpoint}/users`);
  }

  getById(userId: string): Observable<User>{
    return this.api.get<User>(`${this.endpoint}/user/${userId}`);
  }

  update(updatedUser: UpdateUser): Observable<User> {
    return this.api.patch<User>(`${this.endpoint}/update-user`, updatedUser)
  }

  changePassword(changePassword: ChangePassword): Observable<User> {
    return this.api.patch<User>(`${this.endpoint}/set-password`, changePassword);
  }

  requestPasswordReset(userId: string): Observable<string> {
    return this.api.post<string>(`${this.endpoint}/send-reset-link/${userId}`, {});
  }

  resetPassword(request: IResetPassword): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/reset-password`, request);
  }

  delete(userId: string): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/${userId}`);
  }

  getAuthorizationToken(): string | null {
    return this.getStoredToken();
  }

  getCurrentUserId(): string{
    let userId = localStorage.getItem('user_Id');
    if (!userId) {
      return '';
    }
    return userId;
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const userId = this.getCurrentUserId();
    return token !== null && userId != '' && this.isTokenValid(token);
  }

  private handleSuccessfulAuth(user: User): void {
    if (user.token) {
      this.storeToken(user.token);
      this.storeUserId(user.id)
      if (user.refreshToken) {
        this.storeRefreshToken(user.refreshToken);
      }
        this.setCurrentStatus(user);
    }
  }

  private setCurrentStatus(user: User): void {
    this.currentUserSubject.next(user);
    this.loggedInSubject.next(true);
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeRefreshToken(refreshToken: string): void {
    localStorage.setItem('refresh_token', refreshToken);
  }

  private storeUserId(userId: string): void {
    localStorage.setItem(this.userIdKey, userId);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getStoredUserId(): string {
    let userId = localStorage.getItem(this.userIdKey);
    return userId || '';
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  private decodeToken(token: string): TokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.log('error: ', error);
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials';
          this.LogOut();
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  };

  LogOut(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }
}
