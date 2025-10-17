import { Component, Input, OnInit } from '@angular/core';
import { IJD } from '../../../model/jds/i-create-jd';
import { JdService } from '../../../services/jd/jd.service';
import { AuthService } from '../../../services/auth/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-jd-for-emp',
  imports: [],
  templateUrl: './jd-for-emp.component.html',
  styleUrl: './jd-for-emp.component.css'
})
export class JdForEmpComponent implements OnInit{
  @Input() currentUserId: string = '';
  jd!: IJD | null;
  constructor(
    private jdService: JdService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadEmployeeJD();
  }

  private loadEmployeeJD(): void {
    // Load employee, roles list, and all JDs in parallel
    forkJoin({
      user: this.authService.getById(this.currentUserId),
      roles: this.jdService.getAllRoles(),
      jds: this.jdService.getAll()
    }).subscribe({
      next: ({ user, roles, jds }) => {
        const roleName = (user.roles && user.roles.length > 0) ? user.roles[0] : '';

        const matchedRole = roles.find((r: any) =>
          (r.name || r.NormalizedName || '').toLowerCase() === roleName.toLowerCase()
        );

        const found = jds.find(j => String(j.roleId) === String(matchedRole.id));
        this.jd = found ?? null;
      },
      error: () => {
        this.jd = null;
      }
    });
  }
}
