import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TaskEmpReportComponent } from '../task-emp-report/task-emp-report.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute){}
  ngOnInit(): void {
    this.route.firstChild ??
      this.router.navigate(['task-emp-report'], { relativeTo: this.route });

    

    
    
  }
}
