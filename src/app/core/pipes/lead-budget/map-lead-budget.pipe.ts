import { Pipe, PipeTransform } from '@angular/core';
import { LeadBudget } from '../../../model/sales/i-sales-lead';

@Pipe({
  name: 'mapLeadBudget'
})
export class MapLeadBudgetPipe implements PipeTransform {

  transform(budget: LeadBudget): string {
    switch(budget){
      case LeadBudget.Below:
        return 'اقل';
      case LeadBudget.Equal:
        return 'مساوي';
      case LeadBudget.Higher:
        return 'اكثر';
      default:
        return 'غير محدد';
    }
  }

}
