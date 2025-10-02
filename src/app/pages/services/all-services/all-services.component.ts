import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../../../services/services/services.service';
import { Service } from '../../../model/service/service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-services',
  imports: [],
  templateUrl: './all-services.component.html',
  styleUrl: './all-services.component.css'
})
export class AllServicesComponent implements OnInit {
  services: Service[] = [];

  constructor(
    private serviceService: ServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.serviceService.getAll().subscribe({
      next: (data) => {
        this.services = data;
      }
    });
  }

  goToService(serviceId: number) {
    this.router.navigate(['/services', serviceId]);
  }

}

