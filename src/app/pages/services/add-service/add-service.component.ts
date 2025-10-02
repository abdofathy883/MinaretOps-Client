import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { ServicesService } from '../../../services/services/services.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateServiceRequest } from '../../../model/service/service';
import { AlertService } from '../../../services/helper-services/alert.service';

@Component({
  selector: 'app-add-service',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-service.component.html',
  styleUrl: './add-service.component.css',
})
export class AddServiceComponent implements OnInit {
  formService!: FormBuilder;
  isLoading: boolean = false;

  alertMessage = '';
  alertType = 'info';

  serviceForm!: FormGroup;
  
  constructor(
    private serviceService: ServicesService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.serviceForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      image: [null],
      taskItems: this.fb.array([])
    });
  }

  resetForm(): void {
    this.serviceForm.reset();
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      this.isLoading = false;
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const newService: CreateServiceRequest = {
      title: this.serviceForm.value.title,
      description: this.serviceForm.value.description
    };

    this.serviceService.create(newService).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم اضافة الخدمة بنجاح', 'success');
        this.serviceForm.reset();
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('فشل اضافة الخدمة', 'error');
      },
    });
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert() {
    this.alertMessage = '';
  }
}
