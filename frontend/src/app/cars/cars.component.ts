import { Component, OnInit, ViewChild } from '@angular/core';
import { WebService } from '../web.service';
//import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
//import { Car } from '../car';
//import { Http } from '@angular/http';
import { Subject } from 'rxjs';


export interface Car {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  carsList: Car[] = [
    { value: 'volvo', viewValue: 'Volvo' },
    { value: 'saab', viewValue: 'Saab' },
    { value: 'mercedes', viewValue: 'Mercedes' }
  ];

  // MatPaginator Inputs
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // The params pageIndex and pageSize were set in applicationCache.module router
    this.pageIndex = this.route.snapshot.params.pageIndex;
    this.pageSize = this.route.snapshot.params.pageSize;
    if(!this.pageSize) this.pageSize = 10;
    if(!this.pageIndex) this.pageIndex = 0;

    this.webService.getCarsPagination(this.pageIndex, this.pageSize);
    //  this.webService.getCarsPagination(this.webService.pageIndex, this.pageSize);
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }

  onPageChanged(e) {
    this.webService.getCarsPagination(e.pageIndex, e.pageSize);
    // this.router.navigate(['/cars']);
    this.router.navigate(['/cars', { pageIndex: e.pageIndex, pageSize: e.pageSize }]);
  }


}
