import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapTaskPriority'
})
export class MapTaskPriorityPipe implements PipeTransform {

  transform(priority: string): string {
    switch (priority) {
      case 'عالي':
        return 'priority-high';
      case 'متوسط':
        return 'priority-medium';
      case 'عادي':
        return 'priority-normal';
      default:
        return 'priority-normal';
    }
  }

}
