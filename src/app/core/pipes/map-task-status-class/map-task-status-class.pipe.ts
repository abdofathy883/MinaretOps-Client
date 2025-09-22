import { Pipe, PipeTransform } from '@angular/core';
import { CustomTaskStatus } from '../../../model/task/task';

@Pipe({
  name: 'mapTaskStatusClass'
})
export class MapTaskStatusClassPipe implements PipeTransform {

  transform(status: CustomTaskStatus): string {
    switch (status) {
          case CustomTaskStatus.Open:
            return 'status-not-started';
          case CustomTaskStatus.Acknowledged:
            return 'status-acknowledged';
          case CustomTaskStatus.InProgress:
            return 'status-in-progress';
          case CustomTaskStatus.UnderReview:
            return 'status-under-review';
          case CustomTaskStatus.NeedsEdits:
            return 'status-needs-edits';
          case CustomTaskStatus.Completed:
            return 'status-completed';
          default:
            return 'status-unknown';
        }
  }

}
