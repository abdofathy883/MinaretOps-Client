import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../../services/blog/blog.service';
import { IBlogCategory, ICreateBlog } from '../../../model/blog/i-blog';
import { CommonModule } from '@angular/common';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-add-blog',
  imports: [CommonModule, ReactiveFormsModule, EditorModule],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.css'
})
export class AddBlogComponent implements OnInit{
  blogForm!: FormGroup;
  isLoading: boolean = false;
  alertMessage = '';
  alertType = 'info';

  categories: IBlogCategory[] = [];

  featuredImageFile!: File;

  constructor(
    private blogService: BlogService,
    private fb: FormBuilder
  ) {}

  editorConfig: Partial<EditorComponent['init']> = {
    height: 500,
    menubar: true,
    plugins: 'lists link image table code help wordcount',
    toolbar: 
      'undo redo | formatselect | bold italic underline | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | removeformat | help'
  };
  tinyMCEKey = 'l1gb6fej58daznvzum3oo6nk9vgrwa0da34gz5iw6583y5s1';

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      imageAltText: [''],
      categoryId: [''],
      author: [''],
      isFeatured: ['']
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.blogService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
      }
    })
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.featuredImageFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    // const post: ICreateBlog = {
    //   title: this.blogForm.value.title,
    //   content: this.blogForm.value.content,
    //   featuredImage: this.featuredImageFile,
    //   imageAltText: this.blogForm.value.imageAltText,
    //   isFeatured: this.blogForm.value.isfeatured,
    //   categoryId: this.blogForm.value.categoryId,
    //   author: this.blogForm.value.author
    // };
    // this.blogService.createBlog(post).subscribe({
    //   next: (response) => {
    //     this.isLoading = false;
    //     this.showAlert('تم اضافة المقال بنجاح', 'success');
    //   },
    //   error: (error) => {
    //     this.isLoading = false;
    //     this.showAlert(error.message, 'error');
    //   }
    // });
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
