import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IClientServiceCheckpoint, ICreateServiceCheckpoint, IServiceCheckpoint } from '../../model/checkpoint/i-service-checkpoint';

@Injectable({
  providedIn: 'root',
})
export class CheckpointService {
  private endpoint = 'checkpoint';

  constructor(private api: ApiService) {}

  // Service Checkpoints
  getServiceCheckpoints(serviceId: number): Observable<IServiceCheckpoint[]> {
    return this.api.get(`${this.endpoint}/service/${serviceId}/checkpoints`);
  }

  createServiceCheckpoint(
    data: ICreateServiceCheckpoint
  ): Observable<IServiceCheckpoint> {
    return this.api.post(`${this.endpoint}/service-checkpoint`, data);
  }

  updateServiceCheckpoint(
    checkpointId: number,
    data: Partial<IServiceCheckpoint>
  ): Observable<IServiceCheckpoint> {
    return this.api.patch(
      `${this.endpoint}/service-checkpoint/${checkpointId}`,
      data
    );
  }

  deleteServiceCheckpoint(checkpointId: number): Observable<void> {
    return this.api.delete(
      `${this.endpoint}/service-checkpoint/${checkpointId}`
    );
  }

  // Client Service Checkpoints
  getClientServiceCheckpoints(
    clientServiceId: number
  ): Observable<IClientServiceCheckpoint[]> {
    return this.api.get(
      `${this.endpoint}/client-service/${clientServiceId}/checkpoints`
    );
  }

  markCheckpointComplete(
    checkpointId: number,
    employeeId: string
  ): Observable<IClientServiceCheckpoint> {
    return this.api.post(
      `${this.endpoint}/client-service-checkpoint/${checkpointId}/complete`,
      {
        clientServiceCheckpointId: checkpointId,
        employeeId: employeeId,
      }
    );
  }

  markCheckpointIncomplete(
    checkpointId: number
  ): Observable<IClientServiceCheckpoint> {
    return this.api.post(
      `${this.endpoint}/client-service-checkpoint/${checkpointId}/incomplete`,
      null
    );
  }
}
