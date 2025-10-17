import { Component, OnInit } from '@angular/core';
import { JdService } from '../../../services/jd/jd.service';
import { IJD } from '../../../model/jds/i-create-jd';
import { Router } from '@angular/router';
import { MapUserRolePipe } from '../../../core/pipes/map-task-user-role/map-user-role.pipe';

@Component({
  selector: 'app-all-jds',
  imports: [MapUserRolePipe],
  templateUrl: './all-jds.component.html',
  styleUrl: './all-jds.component.css'
})
export class AllJdsComponent implements OnInit{
  jds: IJD[] = [];

  constructor(private jdService: JdService, private router: Router) {}

  ngOnInit(): void {
    this.jdService.getAll().subscribe({
      next: (res) => {
        this.jds = res;
      }
    });
  }

  goToJd(jdId: number) {
    this.router.navigate([`/job-descriptions/${jdId}`]);
  }
}
