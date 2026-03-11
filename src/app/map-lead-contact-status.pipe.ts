import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapLeadContactStatus'
})
export class MapLeadContactStatusPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
