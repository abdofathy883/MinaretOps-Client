import { Component, OnInit } from '@angular/core';
import { IContactForm } from '../../../model/contact-form/i-contact-form';
import { ContactService } from '../../../services/contact/contact.service';
import { ActivatedRoute, Route } from '@angular/router';

@Component({
  selector: 'app-single-entry',
  imports: [],
  templateUrl: './single-entry.component.html',
  styleUrl: './single-entry.component.css'
})
export class SingleEntryComponent implements OnInit{
  entry!: IContactForm;

  constructor(
    private contactSerive: ContactService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const entryIdParam = this.route.snapshot.paramMap.get('id');
    const entryId = Number(entryIdParam);

    this.contactSerive.getById(entryId).subscribe({
      next: (response) => {
        this.entry = response;
      }
    })
  }
}
