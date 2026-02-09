import { Component } from '@angular/core';
import { IInvitation } from '../../../model/emp-invitation/i-invitation';
import { EmpInvitationService } from '../../../services/emp-invitation/emp-invitation.service';
import { UserRoles } from '../../../model/auth/user';
import { DatePipe } from '@angular/common';
import { MapUserRolePipe } from '../../../core/pipes/map-user-role/map-user-role.pipe';

@Component({
  selector: 'app-pending-invitations',
  imports: [DatePipe],
  templateUrl: './pending-invitations.component.html',
  styleUrl: './pending-invitations.component.css'
})
export class PendingInvitationsComponent {
  pendingInvitations: IInvitation[] = [];
  allInvitations: IInvitation[] = [];
  isLoadingPending = false;
  isLoadingAll = false;

  constructor(private invitationService: EmpInvitationService) {}

  ngOnInit(): void {
    this.loadpendingInvitations();
    this.loadAllInvitations();
  }

  loadpendingInvitations(): void {
    this.isLoadingPending = true;
    this.invitationService.getPendingInvitations().subscribe({
      next: (data) => {
        this.pendingInvitations = data;
        this.isLoadingPending = false;
      },
      error: (error) => {
        this.isLoadingPending = false;
        console.log(error);
      }
    });
  }

  loadAllInvitations(){
    this.isLoadingAll = true;
    this.invitationService.getAllInvitations().subscribe({
      next: (response) => {
        this.isLoadingAll = false;
        this.allInvitations = response;
      },
      error: (error) => {
        this.isLoadingAll = false;
        console.log(error);
      }
    })
  }

  approveInvitation(id: number): void {
    if (confirm('هل أنت متأكد من الموافقة على هذه الدعوة وإنشاء الحساب؟')) {
      this.invitationService.approveInvitation(id).subscribe({
        next: () => {
          this.loadpendingInvitations();
          this.loadAllInvitations();
        },
        error: (error) => {
          console.log(error);
          alert(error.error?.message || 'حدث خطأ أثناء الموافقة');
        }
      });
    }
  }

  cancelInvitation(id: number): void {
    if (confirm('هل أنت متأكد من إلغاء هذه الدعوة؟')) {
      this.invitationService.cancelInvitation(id).subscribe({
        next: () => {
          this.loadpendingInvitations();
          this.loadAllInvitations();
        },
        error: (error) => {
          console.log(error);
          alert(error.error?.message || 'حدث خطأ أثناء الإلغاء');
        }
      });
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'قيد الانتظار';
      case 2: return 'مكتملة';
      case 3: return 'منتهية الصلاحية';
      case 4: return 'ملغاة';
      default: return 'غير معروف';
    }
  }

  getRoleName(role: number): string {
    return UserRoles[role] || '';
  }
}
