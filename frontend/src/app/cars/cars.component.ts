import { Component, OnInit, ViewChild } from '@angular/core';
import { WebService } from './web.service';
//import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, RouterLink, Router, Params } from '@angular/router';
import { Car } from './car.model';
import { MatSnackBar } from '@angular/material';
//import { Car } from '../car';
//import { Http } from '@angular/http';
// import { Subject } from 'rxjs';

export interface CarSortBy {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  carsListPrice: CarSortBy[] = [
    { value: 'asc', viewValue: 'Price: Low to Hight' },
    { value: 'desc', viewValue: 'Price: Hight to Low' }
  ];

  // MatPaginator Inputs
  totalRecords: number;
  pageSize: number;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [3, 12, 24, 96];
  sortByprice = "asc"
  cars: Car[];

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) { }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }

  ngOnInit() {
    // The params pageIndex and pageSize were set in applicationCache.module router
    this.pageIndex = this.route.snapshot.params.pageIndex;
    this.pageSize = this.route.snapshot.params.pageSize;

    if (!this.pageSize) this.pageSize = 12;
    if (!this.pageIndex) this.pageIndex = 0;

    this.router.navigate(['/cars', { pageIndex: this.pageIndex, pageSize: this.pageSize, sortByprice: this.sortByprice }]);

    // Detect when the router change and update the element without update the whole page
    this.route.params.subscribe((params: Params) => {
      if (params['pageSize'] || params['pageIndex'] || params['sortByprice']) {
        this.webService.getCarsPagination(params['pageIndex'], params['pageSize'], params['sortByprice']).subscribe(data => {
          this.totalRecords = data.total;
          return this.cars = data.records;
        },
          (error) => {
            this.openSnackBar(error)
          });
      }
    })

  }


  //Execute when the pagination change 
  onPageChanged(e) {
    if (this.route.snapshot.params.sortByprice)
      this.sortByprice = this.route.snapshot.params.sortByprice;

    this.router.navigate(['/cars', { pageIndex: e.pageIndex, pageSize: e.pageSize, sortByprice: this.sortByprice }]);
  }

  // Execute when filter change
  onFilterChanged(e) {
    if (this.route.snapshot.params.pageIndex)
      this.pageIndex = this.route.snapshot.params.pageIndex;

    if (this.route.snapshot.params.pageSize) {
      this.pageSize = this.route.snapshot.params.pageSize;
    }

    this.router.navigate(['/cars', { pageIndex: this.pageIndex, pageSize: this.pageSize, sortByprice: e.value }]);
  }

  private openSnackBar(error) {
    this.router.navigate(['/cars']);
    this.snackBar.open(error, "close", { duration: 6000 });
  }
}




