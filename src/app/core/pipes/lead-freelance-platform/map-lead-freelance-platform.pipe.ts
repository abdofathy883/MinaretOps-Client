import { Pipe, PipeTransform } from '@angular/core';
import { FreelancePlatform } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadFreelancePlatform'
})
export class MapLeadFreelancePlatformPipe implements PipeTransform {

  transform(platform: FreelancePlatform): string {
    switch(platform){
      case FreelancePlatform.Bahr:
        return 'بحر';
      case FreelancePlatform.Upwork:
        return 'Upwork';
      default:
        return 'غير محدد';
    }
  }

}
