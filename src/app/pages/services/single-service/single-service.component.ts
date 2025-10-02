import { Component, OnInit } from '@angular/core';
import { Service, UpdateServiceRequest } from '../../../model/service/service';
import { ServicesService } from '../../../services/services/services.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { AlertService } from '../../../services/helper-services/alert.service';

@Component({
  selector: 'app-single-service',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './single-service.component.html',
  styleUrl: './single-service.component.css',
})
export class SingleServiceComponent implements OnInit {
  service: Service | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  alertMessage = '';
  alertType = 'info';

  serviceForm!: FormGroup;

  constructor(
    private serviceService: ServicesService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) {
        this.isUserAdmin = true;
      }
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) {
        this.isUserAccountManager = true;
      }
    });
    this.initializeForm();
    this.loadService();
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      this.isLoading = false;
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const updateService: UpdateServiceRequest = {
      id: this.service!.id,
      title: this.serviceForm.value.title,
      description: this.serviceForm.value.description,
    };

    this.serviceService.update(updateService).subscribe({
      next: (response) => {
        this.service = response;
        this.isLoading = false;
        this.showAlert('تم حفظ التغييرات بنجاح', 'success');
        this.isEditMode = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('فشل تعديل بيانات الخدمة', 'error');
      },
    });
  }

  loadService() {
    const serviceIdPararm = this.route.snapshot.paramMap.get('id');
    const serviceId = Number(serviceIdPararm);
    this.serviceService.getById(serviceId).subscribe({
      next: (response) => {
        this.service = response;

        this.populateForm(this.service);
      },
    });
  }

  populateForm(service: Service) {
    this.serviceForm.patchValue({
      title: service.title,
      description: service.description,
    });
  }

  initializeForm() {
    this.serviceForm = this.fb.group({
      title: [''],
      description: [''],
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(this.service!);
  }

  toggleVisibility() {
    this.serviceService.toggleVisibility(this.service!.id).subscribe({
      next: (response) => {
        this.service = response;
        this.showAlert('تم تغيير حالة الخدمة بنجاح', 'success');
      },
      error: () => {
        this.showAlert('فشل تغيير حالة الخدمة', 'error');
      },
    });
  }

  deleteService() {
    if (this.service) {
      this.serviceService.delete(this.service.id).subscribe({
        next: () => {
          this.showAlert('تم حذف الخدمة بنجاح', 'success');
          this.service = null;
        },
        error: () => {
          this.showAlert('فشل حذف الخدمة', 'error');
        },
      });
    }
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
