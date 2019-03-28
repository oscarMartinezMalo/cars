import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  @ViewChild('sidenav') sidenav: MatSidenav;
  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  shouldRun = true;
}
