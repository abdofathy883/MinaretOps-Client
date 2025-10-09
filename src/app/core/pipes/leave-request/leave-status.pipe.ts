import { Pipe, PipeTransform } from '@angular/core';
import { LeaveStatus } from '../../../model/attendance-record/attendance-record';

@Pipe({
  name: 'leaveStatus'
})
export class LeaveStatusPipe implements PipeTransform {

  transform(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.Pending:
        return 'قيد التنفيذ';
      case LeaveStatus.Approved:
        return 'تم الموافقة';
      case LeaveStatus.Rejected:
        return 'مرفوضة';
      default:
        return 'غير محدد';
    }
  }

}
