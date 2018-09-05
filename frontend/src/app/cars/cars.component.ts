import { Component } from '@angular/core';
//import { Car } from '../car';
import { WebService } from '../web.service';
// import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent  {

  constructor(private webService: WebService, private route: ActivatedRoute) { }

  ngOnInit(){
    var name = this.route.snapshot.params.id;
    this.webService.getCars(name);
  }

  searchTerm: string;
  pagination = 1;
}
