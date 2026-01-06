import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../model/auth/user';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnChanges {
  openMenu: string | null = null;
  userId: string = '';
  isCollapsed: boolean = false;
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isContentLeader: boolean = false;
  isDesignerLeader: boolean = false;

  @Input() isSidebarCollapsed: boolean = false;
  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // this.userId = this.authService.getCurrentUserId();
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
    this.authService.isContentLeader().subscribe((isLeader) => {
      if (isLeader) this.isContentLeader = true;
    });
    this.authService.isDesignerLeader().subscribe((isLeader) => {
      if (isLeader) this.isDesignerLeader = true;
    });

    // Set initial collapsed state based on screen width
    if (window.innerWidth <= 750) {
      this.isCollapsed = true;
      this.sidebarToggle.emit(true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['isSidebarCollapsed'] &&
      !changes['isSidebarCollapsed'].firstChange
    ) {
      this.isCollapsed = this.isSidebarCollapsed;
    }
  }

  toggleMenu(menu: string) {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }
}
