import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shimmer',
  imports: [CommonModule],
  templateUrl: './shimmer.component.html',
  styleUrl: './shimmer.component.css'
})
export class ShimmerComponent {
  @Input() width: string = '100%';
  @Input() height: string = '160px';
  @Input() borderRadius: string = '4px';
}
