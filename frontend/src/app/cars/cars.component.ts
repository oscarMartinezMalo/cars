import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
// import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
//import { Car } from '../car';
// import { Http } from '@angular/http';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  constructor(private webService: WebService, private route: ActivatedRoute) { }

  cars;

  ngOnInit() {
    var name = this.route.snapshot.params.id;
    this.webService.getCars(name);
    this.webService.carsSubject.subscribe(cars => {
      this.cars = cars;
    })
  }

  searchTerm: string;
  pagination = 1;
}
