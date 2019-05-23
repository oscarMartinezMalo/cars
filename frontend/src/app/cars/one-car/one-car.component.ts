import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Car } from '../car.model';

@Component({
  selector: 'app-one-car',
  templateUrl: './one-car.component.html',
  styleUrls: ['./one-car.component.css']
})
export class OneCarComponent implements OnInit {

  oneCar: Car = new Car();
  id: string;

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit() {

    this.id = this.route.snapshot.params.id;

    if (this.id) {
      this.webService.getOneCar(this.id).
        subscribe(
          (data: Car) => { return this.oneCar = data },
          (error) => { this.openSnackBar(error) });


      this.route.params.subscribe((params: Params) => {
        // Detect when the router change and update the element without update the whole page
        this.webService.getOneCar(params['id']).
          subscribe(
            (data: Car) => { this.oneCar = data; },
            (error) => { this.openSnackBar(error) });
      });
    }
  }

  openSnackBar(error) {
    this.router.navigate(['/cars']);
    this.snackBar.open(error, "close", { duration: 6000 });
  }

}