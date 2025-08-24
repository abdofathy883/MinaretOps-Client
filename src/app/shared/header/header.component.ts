import { CommonModule } from '@angular/common';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../model/auth/user';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  openMenu: string | null = null;
  userId: string = '';
  isCollapsed: boolean = false;
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) {
        this.isUserAdmin = true;
      }
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) {
        this.isUserAccountManager = true;
      }
    });
  }

  toggleMenu(menu: string) {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }
}
