import { Component, inject, OnInit } from '@angular/core';
import { IEntry } from '../../../model/contact/i-entry';
import { ContactService } from '../../../services/contact/contact.service';

@Component({
  selector: 'app-all-entries',
  imports: [],
  templateUrl: './all-entries.component.html',
  styleUrl: './all-entries.component.css'
})
export class AllEntriesComponent implements OnInit{
  allEntries: IEntry[] = [];
  private contactService = inject(ContactService);

  ngOnInit(): void {
    this.contactService.getAll().subscribe({
      next: (response) => {
        this.allEntries = response;
      }
    })
  }
}
