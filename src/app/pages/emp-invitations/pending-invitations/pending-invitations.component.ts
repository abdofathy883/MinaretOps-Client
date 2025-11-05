import { Component } from '@angular/core';
import { IInvitation } from '../../../model/emp-invitation/i-invitation';
import { EmpInvitationService } from '../../../services/emp-invitation/emp-invitation.service';
import { UserRoles } from '../../../model/auth/user';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pending-invitations',
  imports: [DatePipe],
  templateUrl: './pending-invitations.component.html',
  styleUrl: './pending-invitations.component.css'
})
export class PendingInvitationsComponent {
  invitations: IInvitation[] = [];
  isLoading = false;

  constructor(private invitationService: EmpInvitationService) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.isLoading = true;
    this.invitationService.getPendingInvitations().subscribe({
      next: (data) => {
        this.invitations = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  approveInvitation(id: number): void {
    if (confirm('هل أنت متأكد من الموافقة على هذه الدعوة وإنشاء الحساب؟')) {
      this.invitationService.approveInvitation(id).subscribe({
        next: () => {
          this.loadInvitations();
        },
        error: (error) => {
          alert(error.error?.message || 'حدث خطأ أثناء الموافقة');
        }
      });
    }
  }

  cancelInvitation(id: number): void {
    if (confirm('هل أنت متأكد من إلغاء هذه الدعوة؟')) {
      this.invitationService.cancelInvitation(id).subscribe({
        next: () => {
          this.loadInvitations();
        },
        error: (error) => {
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
