import { Component, inject, OnInit } from '@angular/core';
import { ILoginLog } from '../../interfaces/i-login-log';
import { LoginLogService } from '../../services/login-log.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-all-logs',
  imports: [DatePipe],
  templateUrl: './all-logs.component.html',
  styleUrl: './all-logs.component.css'
})
export class AllLogsComponent implements OnInit{
  logs: ILoginLog[] = [];
  private loginService = inject(LoginLogService);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    this.loginService.getAllLogs().subscribe({
      next: (response) => {
        this.logs = response;
      }
    })
  }
}
