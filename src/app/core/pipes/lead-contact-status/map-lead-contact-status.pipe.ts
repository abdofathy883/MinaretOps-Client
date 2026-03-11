import { Pipe, PipeTransform } from '@angular/core';
import { ContactStatus } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadContactStatus'
})
export class MapLeadContactStatusPipe implements PipeTransform {

  transform(status: ContactStatus): string {
    switch(status){
      case ContactStatus.ContactedAndReplied:
        return 'تم التواصل وتم الرد';
      case ContactStatus.ContactedWithNoReply:
        return 'تم التواصل بدون رد';
      case ContactStatus.NotContactedYet:
        return 'لم يتم التواصل بعد';
      case ContactStatus.WrongNumber:
        return 'الرقم خاطئ';
      default:
        return 'غير محدد'
    }
  }

}
