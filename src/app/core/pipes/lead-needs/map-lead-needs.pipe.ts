import { Pipe, PipeTransform } from '@angular/core';
import { NeedsExpectation } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadNeeds',
})
export class MapLeadNeedsPipe implements PipeTransform {
  transform(needs: NeedsExpectation): string {
    switch (needs) {
      case NeedsExpectation.Below:
        return 'اقل';
      case NeedsExpectation.Equal:
        return 'مساوي';
      case NeedsExpectation.Higher:
        return 'اكثر';
      default:
        return 'غير محدد';
    }
  }
}
