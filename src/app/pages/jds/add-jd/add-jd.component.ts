import { Component, OnInit } from '@angular/core';
import { JdService } from '../../../services/jd/jd.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-jd',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-jd.component.html',
  styleUrl: './add-jd.component.css'
})
export class AddJdComponent implements OnInit{
  jdForm!: FormGroup;
  constructor(private jdService: JdService, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.jdForm = this.fb.group({

    })
  }

  onSubmit() {
    
  }
}
