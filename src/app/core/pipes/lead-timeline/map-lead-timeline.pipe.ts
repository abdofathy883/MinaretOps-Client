import { Pipe, PipeTransform } from '@angular/core';
import { LeadTimeline } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadTimeline',
})
export class MapLeadTimelinePipe implements PipeTransform {
  transform(timeline: LeadTimeline): string {
    switch (timeline) {
      case LeadTimeline.Below:
        return 'اقل';
      case LeadTimeline.Equal:
        return 'مساوي';
      case LeadTimeline.Higher:
        return 'اكثر';
      default:
        return 'غير محدد';
    }
  }
}
