import { Component, inject, OnInit } from '@angular/core';
import { IEntry } from '../../../model/contact/i-entry';
import { ContactService } from '../../../services/contact/contact.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-all-entries',
  imports: [DatePipe],
  templateUrl: './all-entries.component.html',
  styleUrl: './all-entries.component.css'
})
export class AllEntriesComponent implements OnInit {
  allEntries: IEntry[] = [];
  selectedEntry: IEntry | null = null;
  loadingEntry = false;
  private contactService = inject(ContactService);

  ngOnInit(): void {
    this.contactService.getAll().subscribe({
      next: (response) => {
        this.allEntries = response;
      }
    });
  }

  openEntryModal(entry: IEntry): void {
    this.loadingEntry = true;
    this.selectedEntry = null;
    const modalEl = document.getElementById('entryDetailModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl) ?? new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
    this.contactService.getById(entry.id).subscribe({
      next: (response) => {
        this.selectedEntry = response;
        this.loadingEntry = false;
      },
      error: () => {
        this.loadingEntry = false;
      }
    });
  }

  closeEntryModal(): void {
    const modalEl = document.getElementById('entryDetailModal');
    if (modalEl) (window as any).bootstrap.Modal.getInstance(modalEl)?.hide();
    this.selectedEntry = null;
  }

  getWhatsAppLink(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    const withCountry = digits.startsWith('0') ? '966' + digits.slice(1) : digits;
    return `https://wa.me/${withCountry}`;
  }

  getCallLink(phoneNumber: string): string {
    return `tel:${phoneNumber}`;
  }
}
