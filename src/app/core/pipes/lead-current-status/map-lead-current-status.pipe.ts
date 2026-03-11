import { Pipe, PipeTransform } from '@angular/core';
import { CurrentLeadStatus } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadCurrentStatus'
})
export class MapLeadCurrentStatusPipe implements PipeTransform {

  transform(status: CurrentLeadStatus): string {
    switch(status){
      case CurrentLeadStatus.Deal:
        return 'Deal';
      case CurrentLeadStatus.FirstCall:
        return 'اتصال أولي';
      case CurrentLeadStatus.Interested:
        return 'مهتم';
      case CurrentLeadStatus.MeetingAgreed:
        return 'اجتماع';
      case CurrentLeadStatus.NewLead:
        return 'عميل جديد';
      case CurrentLeadStatus.NotPotential:
        return 'غير محتمل';
      case CurrentLeadStatus.Potential:
        return 'محتمل';
      default:
        return 'غير محدد';
    }
  }

}
