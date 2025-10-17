import { Component, OnInit } from '@angular/core';
import { IJD, ICreateJD } from '../../../model/jds/i-create-jd';
import { JdService } from '../../../services/jd/jd.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MapUserRolePipe } from '../../../core/pipes/map-task-user-role/map-user-role.pipe';

@Component({
  selector: 'app-single-jd',
  imports: [CommonModule, ReactiveFormsModule, MapUserRolePipe],
  templateUrl: './single-jd.component.html',
  styleUrl: './single-jd.component.css'
})
export class SingleJdComponent implements OnInit{
  jd!: IJD;
  jdForm!: FormGroup;
  roles: any[] = [];
  isLoading: boolean = false;
  jdId!: number;

  alertMessage = '';
  alertType = 'info';

  constructor(
    private jdService: JdService, 
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.jdId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.jdForm = this.fb.group({
      roleId: ['', [Validators.required]],
      jobResponsibilities: this.fb.array([])
    });

    // Load roles
    this.jdService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res;
      }
    });

    // Load JD data
    if (this.jdId) {
      this.loadJD();
    }
  }

  loadJD(): void {
    this.isLoading = true;
    this.jdService.getById(this.jdId).subscribe({
      next: (response) => {
        this.jd = response;
        console.log(this.jd);
        this.populateForm();
      },
      error: (error) => {
        console.error('Error loading JD:', error);
        this.isLoading = false;
      }
    });
  }

  populateForm(): void {
    // Clear existing responsibilities
    while (this.jobResponsibilities.length !== 0) {
      this.jobResponsibilities.removeAt(0);
    }

    // Set role
    this.jdForm.patchValue({
      roleId: this.jd.roleId
    });

    // Add responsibilities
    this.jd.jobResponsibilities.forEach(responsibility => {
      this.addResponsibility(responsibility.text);
    });
  }

  get jobResponsibilities() {
    return this.jdForm.get('jobResponsibilities') as FormArray;
  }

  addResponsibility(text: string = ''): void {
    const responsibilityForm = this.fb.group({
      text: [text, Validators.required]
    });
    this.jobResponsibilities.push(responsibilityForm);
  }

  removeResponsibility(index: number): void {
    if (this.jobResponsibilities.length > 1) {
      this.jobResponsibilities.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.jdForm.valid) {
      const formValue = this.jdForm.value;
      const updateJD: ICreateJD = {
        roleId: formValue.roleId,
        jobResponsibilities: formValue.jobResponsibilities
      };
      this.isLoading = true;
      this.jdService.update(this.jdId, updateJD).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.jd = response;
          this.showAlert('تم تحديث الوصف الوظيفي بنجاح.', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.showAlert(error.error, 'error');
        }
      });
    } else {
      this.jdForm.markAllAsTouched();
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
