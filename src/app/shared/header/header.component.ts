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
export class HeaderComponent implements OnInit{
  openMenu: string | null = null;
  userId: string = '';
  isCollapsed: boolean = false;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(private authService: AuthService) {
  }
  
  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
  }
  
  toggleMenu(menu: string) {
    this.openMenu = this.openMenu === menu ? null : menu;
  }
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }
}
