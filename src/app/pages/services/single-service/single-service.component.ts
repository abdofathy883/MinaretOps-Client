import { Component, OnInit } from '@angular/core';
import { Service } from '../../../model/service/service';
import { ServicesService } from '../../../services/services/services.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-single-service',
  imports: [],
  templateUrl: './single-service.component.html',
  styleUrl: './single-service.component.css'
})
export class SingleServiceComponent implements OnInit{
  service!: Service;

  constructor(
    private serviceService: ServicesService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const serviceIdPararm = this.route.snapshot.paramMap.get('id');
    const serviceId = Number(serviceIdPararm);
    this.serviceService.getById(serviceId).subscribe({
      next: (response) => {
        this.service = response;
      }
    })
  }
}
