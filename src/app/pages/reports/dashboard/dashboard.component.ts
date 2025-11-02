import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TaskEmpReportComponent } from '../task-emp-report/task-emp-report.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, TaskEmpReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  ngOnInit(): void {
    

    

    
    
  }
}
