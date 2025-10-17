import { Component, OnInit } from '@angular/core';
import { JdService } from '../../../services/jd/jd.service';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MapUserRolePipe } from '../../../core/pipes/map-task-user-role/map-user-role.pipe';
import { ICreateJD, ICreateJR } from '../../../model/jds/i-create-jd';

@Component({
  selector: 'app-add-jd',
  imports: [CommonModule, ReactiveFormsModule, MapUserRolePipe],
  templateUrl: './add-jd.component.html',
  styleUrl: './add-jd.component.css'
})
export class AddJdComponent implements OnInit{
  jdForm!: FormGroup;
  roles: any[] = [];
  isLoading: boolean = false;

  alertMessage = '';
  alertType = 'info';
  
  constructor(
    private jdService: JdService, 
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.jdForm = this.fb.group({
      roleId: ['', Validators.required],
      jobResponsibilities: this.fb.array([])
    });
    
    // Add initial responsibility
    this.addResponsibility();
    
    this.jdService.getAllRoles().subscribe({
      next: (res) => {
        console.log(res);
        this.roles = res;
      }
    });
  }

  get jobResponsibilities() {
    return this.jdForm.get('jobResponsibilities') as FormArray;
  }

  addResponsibility(): void {
    const responsibilityForm = this.fb.group({
      text: ['', Validators.required]
    });
    this.jobResponsibilities.push(responsibilityForm);
  }

  removeResponsibility(index: number): void {
    if (this.jobResponsibilities.length > 1) {
      this.jobResponsibilities.removeAt(index);
    }
  }

  onSubmit() {
    if (this.jdForm.valid) {
      const formValue = this.jdForm.value;
      const createJD: ICreateJD = {
        roleId: formValue.roleId,
        jobResponsibilities: formValue.jobResponsibilities
      };
      this.isLoading = true;
      this.jdService.create(createJD).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showAlert('تم إنشاء الوصف الوظيفي بنجاح.', 'success');
          // Navigate to job descriptions list or show success message
        },
        error: (error) => {
          this.isLoading = false;
          this.showAlert(error.error, 'error');
          // Handle error (show error message to user)
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
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
