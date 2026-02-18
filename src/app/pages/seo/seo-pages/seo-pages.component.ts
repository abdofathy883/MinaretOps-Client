import { Component, OnInit, inject, signal } from '@angular/core';
import { SeoService } from '../../../services/seo/seo.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICreateSeo, ISeo } from '../../../model/seo/i-seo';

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
  selectForm!: FormGroup;
  // seoContent: ISeo | null = null;
  isSubmitting = false;
  selectedPage = signal<string>('');
  private ogImage!: File;

  alertMessage = '';
  alertType = 'info';


  ngOnInit(): void {
    this.initializeSelectForm();
  }

  // onPageChange(event: Event) {
  //   const selectElement = event.target as HTMLSelectElement;
  //   const pageRoute = selectElement.value;
    
  //   if (pageRoute) {
  //     this.selectedPage.set(pageRoute);
  //     this.getSeoContent(pageRoute);
  //   } 
  // }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.ogImage = event.target.files[0];
    }
  }

  onSelectPage() {
    if (this.selectForm.invalid) {
      return;
    }
    this.seoService.getSeoContent(this.selectForm.value.lang, this.selectForm.value.route).subscribe({
      next: (response) => {
        this.initializeForm(response);
        // this.seoContent = response;
      },
      error: (error) => {
        console.log('Error fetching SEO content:', error);
      }
    });
  }

  // getSeoContent(pageRoute: string) {
  //   this.seoService.getSeoContent(pageRoute).subscribe({
  //     next: (data: any) => {
  //       this.initializeForm(data);
  //     },
  //     error: () => {
  //       this.initializeForm({});
  //     }
  //   });
  // }

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

  initializeSelectForm(){
    this.selectForm = this.fb.group({
      route: ['', Validators.required],
      lang: ['ar', Validators.required]
    });
  }

  onSubmit(){
    if (this.seoForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const seoData: ICreateSeo = {
      route: this.selectForm.value.route,
      language: this.selectForm.value.lang,
      title: this.seoForm.value.title,
      description: this.seoForm.value.description,
      keywords: this.seoForm.value.keywords,
      ogTitle: this.seoForm.value.ogTitle,
      ogImage: this.ogImage,
      canonicalUrl: this.seoForm.value.canonicalUrl,
      robots: this.seoForm.value.robots
    }
    this.seoService.saveNewSeo(seoData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.alertMessage = 'تم حفظ محتوى السيو بنجاح';
        this.alertType = 'success';
      },
      error: (error) => {
        this.isSubmitting = false;
        this.alertMessage = 'حدث خطأ أثناء حفظ محتوى السيو';
        this.alertType = 'danger';
        console.log('Error saving SEO content:', error);
      }
    });
  }
}
