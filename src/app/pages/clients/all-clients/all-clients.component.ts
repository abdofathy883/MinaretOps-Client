import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { LightWieghtClient, ClientStatus } from '../../../model/client/client';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShimmerComponent } from "../../../shared/shimmer/shimmer.component";

@Component({
  selector: 'app-all-clients',
  imports: [CommonModule, ShimmerComponent],
  templateUrl: './all-clients.component.html',
  styleUrl: './all-clients.component.css'
})
export class AllClientsComponent implements OnInit{
  clients: LightWieghtClient[] = [];
  isLoadingClients: boolean = false;
  
  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoadingClients = true;
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.isLoadingClients = false;
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
