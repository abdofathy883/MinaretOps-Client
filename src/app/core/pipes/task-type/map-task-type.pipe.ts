import { Pipe, PipeTransform } from '@angular/core';
import { TaskType } from '../../../model/task/task';

@Pipe({
  name: 'mapTaskType'
})
export class MapTaskTypePipe implements PipeTransform {

  transform(type: TaskType): string {
    switch (type) {
          case TaskType.Ad_Management:
            return 'Ad Management';
          case TaskType.Backend:
            return 'Backend';
          case TaskType.ContentStrategy:
            return 'Content Strategy';
          case TaskType.ContentWriting:
            return 'Content Writing';
          case TaskType.DesignDirections:
            return 'Design Directions';
          case TaskType.E_mailMarketing:
            return 'E-mail Marketing';
          case TaskType.Frontend:
            return 'Frontend';
          case TaskType.HostingManagement:
            return 'Hosting Management';
          case TaskType.Illustrations:
            return 'Illustrations';
          case TaskType.LogoDesign:
            return 'Logo Design';
          case TaskType.Meeting:
            return 'Meeting';
          case TaskType.Moderation:
            return 'Moderation';
          case TaskType.Motion:
            return 'Motion';
          case TaskType.Planning:
            return 'Planning';
          case TaskType.PrintingsDesign:
            return 'Printings Design';
          case TaskType.Publishing:
            return 'Publishing';
          case TaskType.SEO:
            return 'SEO';
          case TaskType.SM_Design:
            return 'SM Design';
          case TaskType.UI_UX:
            return 'UI/UX';
          case TaskType.VideoEditing:
            return 'Video Editing';
          case TaskType.VisualIdentity:
            return 'Visual Identity';
          case TaskType.Voiceover:
            return 'Voiceover';
          case TaskType.WhatsAppMarketing:
            return 'WhatsApp Marketing';
          case TaskType.WordPress:
            return 'WordPress';
          default:
            return 'غير محدد';
        }
  }

}
