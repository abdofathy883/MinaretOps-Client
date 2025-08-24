import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { ClientDTO, LightWieghtClient, ClientStatus } from '../../../model/client/client';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-clients',
  imports: [CommonModule],
  templateUrl: './all-clients.component.html',
  styleUrl: './all-clients.component.css'
})
export class AllClientsComponent implements OnInit{
  clients: LightWieghtClient[] = [];
  
  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response;
      }
    })
  }

  getStatusText(status: ClientStatus): string {
    switch (status) {
      case ClientStatus.Active:
        return 'نشط';
      case ClientStatus.OnHold:
        return 'متوقف مؤقتا';
      case ClientStatus.Cancelled:
        return 'الغى التعاقد';
      default:
        return 'غير معروف';
    }
  }

  getStatusClass(status: ClientStatus): string {
    switch (status) {
      case ClientStatus.Active:
        return 'active';
      case ClientStatus.OnHold:
        return 'onhold';
      case ClientStatus.Cancelled:
        return 'cancelled';
      default:
        return 'unknown';
    }
  }

  goToClient(id: number) {
    this.router.navigate(['/clients', id]);
  }
}
