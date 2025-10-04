import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../../services/blog/blog.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICreateBlogCategory } from '../../../model/blog/i-blog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit{
  catForm!: FormGroup;
  isLoading: boolean = false;
  constructor(
    private blogService: BlogService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catForm = this.fb.group({
      title: ['', Validators.required],
      language: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.catForm.invalid) {
      this.catForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const cat : ICreateBlogCategory = {
      title: this.catForm.value.title,
      language: Number(this.catForm.value.language)
    };

    console.log(cat);

    this.blogService.createCategory(cat).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('done');
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.message);
      }
    })

  }

  goToCat(title: string) {
    
  }
  
}
