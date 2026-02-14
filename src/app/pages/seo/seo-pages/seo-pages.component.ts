import { Component, OnInit, inject, signal } from '@angular/core';
import { SeoService } from '../../../services/seo/seo.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seo-pages',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seo-pages.component.html',
  styleUrl: './seo-pages.component.css'
})
export class SeoPagesComponent implements OnInit{
  private seoService = inject(SeoService);
  private fb = inject(FormBuilder);

  seoForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  selectedPage = signal<string>('');

  ngOnInit(): void {
    
  }

  onPageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const pageRoute = selectElement.value;
    
    if (pageRoute) {
      this.selectedPage.set(pageRoute);
      this.getSeoContent(pageRoute);
    } 
  }

  getSeoContent(pageRoute: string) {
    this.seoService.getSeoContent(pageRoute).subscribe({
      next: (data: any) => {
        this.initializeForm(data);
      },
      error: () => {
        this.initializeForm({});
      }
    });
  }

  initializeForm(data: any){
    this.seoForm = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || ''],
      keywords: [data.keywords || ''],
      ogTitle: [data.ogTitle || ''],
      ogImage: [null],
      canonicalUrl: [data.canonicalUrl || ''],
      robots: [data.robots || '']
    });
  }

  onSubmit(){
    if (this.seoForm.valid) {
      this.isSubmitting.set(true);
      // TODO: Implement save logic
      setTimeout(() => this.isSubmitting.set(false), 1000);
    }
  }
}
