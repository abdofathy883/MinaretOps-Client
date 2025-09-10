import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-my-kpis-management',
  imports: [],
  templateUrl: './my-kpis-management.component.html',
  styleUrl: './my-kpis-management.component.css'
})
export class MyKpisManagementComponent {
  @Input() currentUserId: string | null = null;
}
