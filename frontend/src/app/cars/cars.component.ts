import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
//import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
//import { Car } from '../car';
//import { Http } from '@angular/http';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  // MatPaginator Inputs
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  cars;
  carsToShow = [];

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(private webService: WebService, private route: ActivatedRoute) { }

  ngOnInit() {

    var name = this.route.snapshot.params.id;
    this.webService.getCars(name);
    this.webService.cars.subscribe((data) => {
      this.cars = data;
      this.carsToShow = this.cars.slice(0, this.pageSize);
      this.length = this.cars.length;
    });

  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }

  onPageChanged(e) {
    let firstCut = e.pageIndex * e.pageSize;
    let secondCut = firstCut + e.pageSize;
    this.carsToShow = this.cars.slice(firstCut, secondCut);
  }
}
