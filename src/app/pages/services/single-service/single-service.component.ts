import { Component, OnInit } from '@angular/core';
import { Service, UpdateServiceRequest } from '../../../model/service/service';
import { ServicesService } from '../../../services/services/services.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

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
  errorMessage: string = '';
  successMessage: string = '';
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;

  serviceForm!: FormGroup;

  constructor(
    private serviceService: ServicesService,
    private route: ActivatedRoute,
    private authService: AuthService,
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
        this.successMessage = 'تم حفظ التغييرات بنجاح';
        this.isEditMode = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
        this.errorMessage = 'حدث خطأ أثناء حفظ التغييرات';
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
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(this.service!);
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleVisibility() {
    this.serviceService.toggleVisibility(this.service!.id).subscribe({
      next: (response) => {
        this.service = response;
        this.successMessage = 'تم تغيير حالة الخدمة بنجاح';
      },
      error: (error) => {
        console.log(error)
        this.errorMessage = 'حدث خطأ أثناء تغيير حالة الخدمة';
      },
    });
    
  }

  deleteService() {
    if (this.service) {
      this.serviceService.delete(this.service.id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف الخدمة بنجاح';
          this.service = null;
        },
        error: () => {
          this.errorMessage = 'حدث خطأ أثناء حذف الخدمة';
        },
      });
    }
  }
}
