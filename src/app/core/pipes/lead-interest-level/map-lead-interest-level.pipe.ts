import { Pipe, PipeTransform } from '@angular/core';
import { InterestLevel } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadInterestLevel',
})
export class MapLeadInterestLevelPipe implements PipeTransform {
  transform(level: InterestLevel): string {
    switch (level) {
      case InterestLevel.Cold:
        return 'منخفضة';
      case InterestLevel.Hot:
        return 'عالية';
      case InterestLevel.Warm:
        return 'متوسطة';
      default:
        return 'غير محدد';
    }
  }
}
