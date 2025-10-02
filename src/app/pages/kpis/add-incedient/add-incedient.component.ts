import { Component, OnInit } from '@angular/core';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { KpiService } from '../../../services/kpis/kpi.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ICreateIncedint } from '../../../model/kpis/icreate-incedint';
import { AlertService } from '../../../services/helper-services/alert.service';

@Component({
  selector: 'app-add-incedient',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './add-incedient.component.html',
  styleUrl: './add-incedient.component.css',
})
export class AddIncedientComponent implements OnInit {
  employees: User[] = [];
  kpiForm!: FormGroup;
  isLoading: boolean = false;
  private evidenceFile!: File;

  alertMessage = '';
  alertType = 'info';

  constructor(
    private authService: AuthService,
    private kpiService: KpiService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.kpiForm = this.fb.group({
      employeeId: ['', Validators.required],
      aspect: ['', Validators.required],
      description: [''],
      evidenceURL: [null],
      date: ['']
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.evidenceFile = event.target.files[0];
    }
  }

  loadEmployees() {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      },
    });
  }

  onSubmit() {
    if (this.kpiForm.invalid) {
      this.isLoading = false;
      this.kpiForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const incedient: FormData = new FormData();
    incedient.append('employeeId', this.kpiForm.value.employeeId);
    incedient.append('aspect', this.kpiForm.value.aspect);
    incedient.append('description', this.kpiForm.value.description);
    incedient.append('evidenceURL', this.evidenceFile);
    incedient.append('date', this.kpiForm.value.date);

    this.kpiService.create(incedient).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم اضافة المخالفة بنجاح', 'success');
      },
      error: () => {
        this.showAlert('فشل اضافة المخالفة', 'error');
      }
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
