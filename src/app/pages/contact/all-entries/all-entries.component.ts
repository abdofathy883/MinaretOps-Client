import { Component, OnInit } from '@angular/core';
import { IContactForm } from '../../../model/contact-form/i-contact-form';
import { ContactService } from '../../../services/contact/contact.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-entries',
  imports: [],
  templateUrl: './all-entries.component.html',
  styleUrl: './all-entries.component.css',
})
export class AllEntriesComponent implements OnInit {
  entries: IContactForm[] = [];

  constructor(
    private contactService: ContactService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.contactService.getAll().subscribe({
      next: (response) => {
        this.entries = response;
      },
    });
  }

  goToEntry(id: number) {
    this.router.navigate(['/contact-form-entries', id])
  }
}
