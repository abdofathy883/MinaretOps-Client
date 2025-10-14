import { Component, OnInit } from '@angular/core';
import { JdService } from '../../../services/jd/jd.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MapUserRolePipe } from '../../../core/pipes/map-task-user-role/map-user-role.pipe';

@Component({
  selector: 'app-add-jd',
  imports: [CommonModule, ReactiveFormsModule, MapUserRolePipe],
  templateUrl: './add-jd.component.html',
  styleUrl: './add-jd.component.css'
})
export class AddJdComponent implements OnInit{
  jdForm!: FormGroup;
  roles: any[] = [];
  constructor(private jdService: JdService, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.jdForm = this.fb.group({

    });
    this.jdService.getAllRoles().subscribe({
      next: (res) => {
        console.log(res);
        this.roles = res;
      }
    })
  }

  onSubmit() {
    
  }
}
