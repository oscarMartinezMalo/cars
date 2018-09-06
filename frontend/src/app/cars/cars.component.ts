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

  ngOnInit() {
    var name = this.route.snapshot.params.id;
    this.webService.getCars(name);
  }

  searchTerm: string;
  pagination = 1;
}
