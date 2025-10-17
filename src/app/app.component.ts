import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { AuthService } from './services/auth/auth.service';
import { PushNotificationService } from './services/push-notification/push-notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isSidebarCollapsed = false;
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private pushNotificationService: PushNotificationService) { }
  
  async ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
    })
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Set initial sidebar state based on screen width
    this.checkScreenSize();
    // Request notification permission
    const hasPermission = await this.pushNotificationService.requestNotificationPermission();
    
    if (hasPermission) {
      // Get current user ID (from your auth service)
      const userId = this.authService.getCurrentUserId(); // Implement this method
      await this.pushNotificationService.subscribeToNotifications(userId);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (window.innerWidth <= 750) {
      this.isSidebarCollapsed = true;
    }
  }

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
