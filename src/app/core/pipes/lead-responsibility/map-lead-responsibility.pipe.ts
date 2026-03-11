import { Pipe, PipeTransform } from '@angular/core';
import { LeadResponsibility } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadResponsibility'
})
export class MapLeadResponsibilityPipe implements PipeTransform {

  transform(responsibility: LeadResponsibility): string {
    switch(responsibility){
      case LeadResponsibility.NotResponsible:
        return 'ليس المسئول';
      case LeadResponsibility.Responsible_DecisionMaker:
        return 'المسئول وصاحب القرار';
      case LeadResponsibility.Responsible_NOT_DecisionMaker:
        return 'المسئول - وليس صاحب القرار';
      default:
        return 'غير محدد';
    }
  }

}
