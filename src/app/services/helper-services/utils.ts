import { FormGroup } from '@angular/forms';

export function hasError(form: FormGroup, controlName: string): boolean {
  const control = form.get(controlName);
  return control ? control.invalid && control.touched : false;
}

export function getErrorMessage(form: FormGroup, controlName: string): string {
  const control = form.get(controlName);
  if (!control || !control.errors || !control.touched) return '';

  if (control.errors['required']) return 'هذا الحقل مطلوب';
  if (control.errors['minlength']) return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
  if (control.errors['maxlength']) return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;

  return 'قيمة غير صحيحة';
}