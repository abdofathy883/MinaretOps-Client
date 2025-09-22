import { Pipe, PipeTransform } from '@angular/core';
import { KPIAspect } from '../../../model/kpis/icreate-incedint';

@Pipe({
  name: 'mapKpiAspect'
})
export class MapKpiAspectPipe implements PipeTransform {

  transform(aspect: KPIAspect): string {
    switch(aspect) {
      case KPIAspect.Commitment: return 'الالتزام';
      case KPIAspect.Cooperation: return 'التعاون';
      case KPIAspect.CustomerSatisfaction: return 'رضا العميل';
      case KPIAspect.Productivity: return 'الإنتاجية';
      case KPIAspect.QualityOfWork: return 'جودة العمل';
      default: return 'غير معروف';
    }
  }

}
