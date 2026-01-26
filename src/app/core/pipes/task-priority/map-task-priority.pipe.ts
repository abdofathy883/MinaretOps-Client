import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapTaskPriority'
})
export class MapTaskPriorityPipe implements PipeTransform {

  transform(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'مستعجل':
        return 'priority-high';
      case 'مهم':
        return 'priority-medium';
      case 'عادي':
        return 'priority-normal';
      default:
        return 'priority-normal';
    }
  }

}
