import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
// import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
//import { Car } from '../car';
// import { Http } from '@angular/http';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  constructor(private webService: WebService, private route: ActivatedRoute) { }
  carsSubject = new Subject();
  ngOnInit() {
    var name = this.route.snapshot.params.id;
    this.webService.getCars(name);    
  }

  searchTerm: string;
  pagination = 1;
}
