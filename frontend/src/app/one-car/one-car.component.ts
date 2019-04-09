import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
// import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { Car } from '../Car';
// import { Car } from '../car';


@Component({
  selector: 'app-one-car',
  templateUrl: './one-car.component.html',
  styleUrls: ['./one-car.component.css']
})
export class OneCarComponent implements OnInit {

  oneCar: Car;
  id: string;
  constructor(private webService: WebService, private route: ActivatedRoute) { }

  ngOnInit() {

    this.id = this.route.snapshot.params.id;
    if (this.id) {
      this.webService.getOneCar(this.id).subscribe(data => {
        return this.oneCar = data;
      });
    }

    // Detect when the router change and update the element without update the whole page
    this.route.params.subscribe((params: Params) => {
      this.webService.getOneCar(params['id']).subscribe(data => {
        return this.oneCar = data;
      });
    });

  }

}


