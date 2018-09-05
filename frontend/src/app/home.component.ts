import { Component } from '@angular/core';
import { CarsComponent } from './cars/cars.component';

@Component({
  selector: 'app-home',
  template: `
    <app-cars></app-cars>`
    ,
})
export class HomeComponent {
}
