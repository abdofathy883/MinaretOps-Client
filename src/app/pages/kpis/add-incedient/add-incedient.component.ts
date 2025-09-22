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
  private evidenceFile!: File;

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
      evidenceURL: [null]
    })
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.evidenceFile = event.target.files[0];
      // this.kpiForm.patchValue({
      //   evidenceURL: this.evidenceFile.name
      // });
    }
  }

  loadEmployees() {
    this.authService.getAll().subscribe({
      next: (response) => {
        this.employees = response;
      }
    })
  }

  onSubmit() {
    debugger;
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

    console.log(incedient);

    

    this.kpiService.create(incedient).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log(response);
      }
    })
  }
}
