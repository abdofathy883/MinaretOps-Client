import { Pipe, PipeTransform } from '@angular/core';
import { LeadSource } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadSource'
})
export class MapLeadSourcePipe implements PipeTransform {

  transform(source: LeadSource): string {
    switch(source) {
      case LeadSource.Facebook:
        return 'Facebook';
      case LeadSource.FreelancingPlatforms:
        return 'منصات العمل الحر';
      case LeadSource.GoogleMaps:
        return 'Google Maps';
      case LeadSource.Instagram:
        return 'Instagram';
      case LeadSource.LinkedIn:
        return 'LinkedIn';
      case LeadSource.Referral:
        return 'احالة';
      case LeadSource.Website:
        return 'الموقع الالكتروني';
      default:
        return 'غير محدد'
    }
  }

}
