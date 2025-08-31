import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import * as pbi from 'powerbi-client';
import { models } from 'powerbi-client';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild('reportContainer', { static: true }) reportContainer!: ElementRef;
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    const embedConfig: pbi.IEmbedConfiguration = {
      type: 'report',
      id: 'YOUR_REPORT_ID',
      embedUrl: 'YOUR_EMBED_URL',
      accessToken: 'ACCESS_TOKEN_FROM_BACKEND',
      tokenType: models.TokenType.Embed,
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: true }
        }
      }
    };

    const powerbiService = new pbi.service.Service(
      pbi.factories.hpmFactory,
      pbi.factories.wpmpFactory,
      pbi.factories.routerFactory
    );

    powerbiService.embed(this.reportContainer.nativeElement, embedConfig);
    
  }
}
