import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapUserRole'
})
export class MapUserRolePipe implements PipeTransform {

  transform(role: string): string {
    switch (role) {
      case 'Admin':
        return 'Admin';
      case 'AccountManager':
        return 'Account Manager';
      case 'ContentCreatorTeamLeader':
        return 'Content Creator Team Leader';
      case 'ContentCreator':
        return 'Content Creator';
      case 'GraphicDesignerTeamLeader':
        return 'Graphic Designer Team Leader';
      case 'GraphicDesigner':
        return 'Graphic Designer';
      case 'AdsSpecialest':
        return 'Ads Specialest';
      case 'SEOSpecialest':
        return 'SEO Specialest';
      case 'VideoEditor':
        return 'Video Editor';
      case 'WebDeveloper':
        return 'Web Developer';
      case 'Finance':
        return 'Finance';
      default:
        return 'غير محدد';
    }
  }

}
