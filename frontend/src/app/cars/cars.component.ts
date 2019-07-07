import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { WebService } from './web.service';
import { AuthService } from '../auth/auth.service';
//import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Car } from './car.model';
import { MatSnackBar, MatPaginator } from '@angular/material';
// import { MatPaginatorModule } from '@angular/material';

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
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  carsListPrice: CarSortBy[] = [
    { value: 'asc', viewValue: 'Price: Low to Hight' },
    { value: 'desc', viewValue: 'Price: Hight to Low' }
  ];

  // MatPaginator Inputs
  totalRecords: number;
  pageSize: number;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [4, 12, 24, 96];
  sortByprice = "asc" //Sort ascending
  cars: Car[];

  search: string = "";

  constructor(private webService: WebService, private auth: AuthService, private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) { }

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
      // Close the sideNav when a change is detected
      this.sidenav.close();

      if (params['pageSize'] || params['pageIndex'] || params['sortByprice']) {

        this.webService.getCarsPagination(params['pageIndex'], params['pageSize'], params['sortByprice'], params['search']).subscribe(data => {
          this.totalRecords = data.total;
          return this.cars = data.records;
        },
          (error) => {
            this.openSnackBar(error)
          });
      }

    })

  }

  // NavBar 
  sideNavOpen() {
    if (this.auth.isAuthenticated) {
      this.sidenav.open()
    }
  }

  // On click in the search button
  onSearch() {
    // Check if the search filter change if the search url is differnt from the input search the perform the search
    if (this.search != this.route.snapshot.params.search) {
      if (this.route.snapshot.params.sortByprice) this.sortByprice = this.route.snapshot.params.sortByprice;
      if (this.route.snapshot.params.pageSize) this.pageSize = this.route.snapshot.params.pageSize;

      if (this.route.snapshot.params.pageIndex) {
        //Reset the page index when the search changes
        this.pageIndex = 0;
        this.paginator.pageIndex = 0;
      }

      this.router.navigate(['/cars', { pageIndex: this.pageIndex, pageSize: this.pageSize, sortByprice: this.sortByprice, search: this.search }]);
    }
  }

  onSearchEnter() {
    this.onSearch();
  }

  //Execute when the pagination change 
  onPageChanged(e) {

    if (this.route.snapshot.params.sortByprice) this.sortByprice = this.route.snapshot.params.sortByprice;

    this.router.navigate(['/cars', { pageIndex: e.pageIndex, pageSize: e.pageSize, sortByprice: this.sortByprice, search: this.search }]);
  }

  // Execute when filter change
  onFilterChanged(e) {

    if (this.route.snapshot.params.pageIndex) this.pageIndex = this.route.snapshot.params.pageIndex;
    if (this.route.snapshot.params.pageSize) this.pageSize = this.route.snapshot.params.pageSize;

    this.router.navigate(['/cars', { pageIndex: this.pageIndex, pageSize: this.pageSize, sortByprice: e.value, search: this.search }]);
  }

  private openSnackBar(error) {
    this.router.navigate(['/cars']);
    this.snackBar.open(error, "close", { duration: 6000 });
  }
}




