import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/clients/client.service';
import { IClient, LightWieghtClient } from '../../../model/client/client';
import { TaskGroupsComponent } from '../../clients/client-mini-components/task-groups/task-groups.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-add-task',
  imports: [TaskGroupsComponent, ReactiveFormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent implements OnInit {
  clients: LightWieghtClient[] = [];
  currentClient!: IClient;
  clientForm!: FormGroup;
  isLoadingClientService: boolean = false;
  constructor(private clientService: ClientService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadClients();
    this.clientForm = this.fb.group({
      clientId: ['', Validators.required],
    });
  }

  loadClients() {
    this.clientService.getAll().subscribe({
      next: (response) => {
        this.clients = response;
      },
    });
  }

  onFilterSubmit() {
    const selectedClientId = this.clientForm.get('clientId')?.value;
    this.isLoadingClientService = true;
    this.clientService.getById(selectedClientId).subscribe({
      next: (response) => {
        this.isLoadingClientService = false;
        this.currentClient = response;
      },
    });
  }
}
