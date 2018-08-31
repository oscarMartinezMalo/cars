import { Component, OnInit } from '@angular/core';
//import { Car } from '../car';
import { WebService } from '../web.service';
import { Http } from '@angular/http';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  constructor(private webService: WebService) { }

  searchTerm: string;
  pagination = 1;

   cars = [];

 async ngOnInit() {

    this.cars = (await this.webService.getCars()).json();
  }

}
