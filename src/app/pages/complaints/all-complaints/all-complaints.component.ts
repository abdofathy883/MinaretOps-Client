import { Component, OnInit } from '@angular/core';
import { IComplaint } from '../../../model/complaints/i-complaint';
import { ComplaintService } from '../../../services/complaints/complaint.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-all-complaints',
  imports: [DatePipe],
  templateUrl: './all-complaints.component.html',
  styleUrl: './all-complaints.component.css'
})
export class AllComplaintsComponent implements OnInit{
  complaints: IComplaint[] = [];

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.complaintService.getAll().subscribe({
      next: (response) => {
        this.complaints = response;
      }
    })
  }
}
