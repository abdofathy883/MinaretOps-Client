import { Component, OnInit } from '@angular/core';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { KpiService } from '../../../services/kpis/kpi.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ICreateIncedint } from '../../../model/kpis/icreate-incedint';

@Component({
  selector: 'app-add-incedient',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './add-incedient.component.html',
  styleUrl: './add-incedient.component.css'
})
export class AddIncedientComponent implements OnInit{
  employees: User[] = [];
  kpiForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private kpiService: KpiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.kpiForm = this.fb.group({
      employeeId: ['', Validators.required],
      aspect: ['', Validators.required],
      description: [''],
      evidenceURL: ['']
    })
  }

  loadEmployees() {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      }
    })
  }

  onSubmit() {
    if (this.kpiForm.invalid) {
      this.isLoading = false;
      this.kpiForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const incedient: ICreateIncedint = {
      employeeId: this.kpiForm.value.employeeId,
      aspect: this.kpiForm.value.aspect,
      description: this.kpiForm.value.description,
      evidenceURL: this.kpiForm.value.evidenceURL
    }

    

    this.kpiService.create(incedient).subscribe({
      next: (response) => {
        this.isLoading = false;
      }
    })
  }
}
