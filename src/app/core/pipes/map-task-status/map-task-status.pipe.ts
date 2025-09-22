import { Pipe, PipeTransform } from '@angular/core';
import { CustomTaskStatus } from '../../../model/task/task';

@Pipe({
  name: 'mapTaskStatus'
})
export class MapTaskStatusPipe implements PipeTransform {

  transform(status: CustomTaskStatus): string {
    switch (status) {
      case CustomTaskStatus.Open:
        return 'لم تبدأ';
      case CustomTaskStatus.Acknowledged:
        return 'تم الإقرار';
      case CustomTaskStatus.InProgress:
        return 'قيد التنفيذ';
      case CustomTaskStatus.UnderReview:
        return 'قيد المراجعة';
      case CustomTaskStatus.NeedsEdits:
        return 'تحتاج إلى تعديلات';
      case CustomTaskStatus.Completed:
        return 'مكتمل';
      default:
        return 'غير محدد';
    }
  }

}
