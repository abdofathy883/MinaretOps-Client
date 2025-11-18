import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IClientService } from '../../../../../model/client/client';
import { IClientServiceCheckpoint } from '../../../../../model/checkpoint/i-service-checkpoint';
import { CheckpointService } from '../../../../../services/checkpoints/checkpoint.service';
import { AuthService } from '../../../../../services/auth/auth.service';


@Component({
  selector: 'app-checkpoints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkpoints.component.html',
  styleUrl: './checkpoints.component.css'
})
export class CheckpointsComponent implements OnInit {
  @Input() clientServices: IClientService[] = [];
  @Input() currentUserId: string = '';
  @Output() checkpointsChanged = new EventEmitter<void>();

  checkpointsMap: Map<number, IClientServiceCheckpoint[]> = new Map();
  loadingMap: Map<number, boolean> = new Map();
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  isContentLeader: boolean = false;
  isDesignerLeader: boolean = false;

  alertMessage = '';
  alertType = 'info';

  constructor(
    private checkpointService: CheckpointService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserRoles();
    this.loadCheckpoints();
  }

  loadUserRoles(): void {
    this.authService.isAdmin().subscribe((isAdmin) => {
      this.isUserAdmin = isAdmin;
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      this.isUserAccountManager = isAccountManager;
    });
    this.authService.isContentLeader().subscribe((isLeader) => {
      this.isContentLeader = isLeader;
    });
    this.authService.isDesignerLeader().subscribe((isLeader) => {
      this.isDesignerLeader = isLeader;
    });
  }

  loadCheckpoints(): void {
    this.clientServices.forEach((clientService) => {
      this.loadCheckpointsForService(clientService.id);
    });
  }

  loadCheckpointsForService(clientServiceId: number): void {
    this.loadingMap.set(clientServiceId, true);
    this.checkpointService.getClientServiceCheckpoints(clientServiceId).subscribe({
      next: (checkpoints) => {
        this.checkpointsMap.set(clientServiceId, checkpoints);
        this.loadingMap.set(clientServiceId, false);
      },
      error: () => {
        this.loadingMap.set(clientServiceId, false);
        this.showAlert('حدث خطأ في تحميل نقاط التحقق', 'error');
      }
    });
  }

  canMarkCheckpoint(): boolean {
    return this.isUserAdmin || 
           this.isUserAccountManager || 
           this.isContentLeader || 
           this.isDesignerLeader;
  }

  toggleCheckpoint(checkpoint: IClientServiceCheckpoint): void {
    if (!this.canMarkCheckpoint()) {
      this.showAlert('ليس لديك صلاحية لتعديل نقاط التحقق', 'error');
      return;
    }

    if (checkpoint.isCompleted) {
      this.markIncomplete(checkpoint);
    } else {
      this.markComplete(checkpoint);
    }
  }

  markComplete(checkpoint: IClientServiceCheckpoint): void {
    this.checkpointService.markCheckpointComplete(checkpoint.id, this.currentUserId).subscribe({
      next: (updatedCheckpoint) => {
        this.updateCheckpointInMap(updatedCheckpoint);
        this.showAlert('تم تحديد نقطة التحقق كمكتملة', 'success');
        this.checkpointsChanged.emit();
      },
      error: () => {
        this.showAlert('حدث خطأ في تحديث نقطة التحقق', 'error');
      }
    });
  }

  markIncomplete(checkpoint: IClientServiceCheckpoint): void {
    this.checkpointService.markCheckpointIncomplete(checkpoint.id).subscribe({
      next: (updatedCheckpoint) => {
        this.updateCheckpointInMap(updatedCheckpoint);
        this.showAlert('تم إلغاء إكمال نقطة التحقق', 'success');
        this.checkpointsChanged.emit();
      },
      error: () => {
        this.showAlert('حدث خطأ في تحديث نقطة التحقق', 'error');
      }
    });
  }

  private updateCheckpointInMap(updatedCheckpoint: IClientServiceCheckpoint): void {
    const checkpoints = this.checkpointsMap.get(updatedCheckpoint.clientServiceId);
    if (checkpoints) {
      const index = checkpoints.findIndex(c => c.id === updatedCheckpoint.id);
      if (index !== -1) {
        checkpoints[index] = updatedCheckpoint;
      }
    }
  }

  getCheckpointsForService(clientServiceId: number): IClientServiceCheckpoint[] {
    return this.checkpointsMap.get(clientServiceId) || [];
  }

  isLoading(clientServiceId: number): boolean {
    return this.loadingMap.get(clientServiceId) || false;
  }

  getCompletionPercentage(clientServiceId: number): number {
    const checkpoints = this.getCheckpointsForService(clientServiceId);
    if (checkpoints.length === 0) return 0;
    const completed = checkpoints.filter(c => c.isCompleted).length;
    return Math.round((completed / checkpoints.length) * 100);
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert(): void {
    this.alertMessage = '';
  }
}