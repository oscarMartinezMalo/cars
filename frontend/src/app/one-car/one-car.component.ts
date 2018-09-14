import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
// import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
// import { Car } from '../car';


@Component({
  selector: 'app-one-car',
  templateUrl: './one-car.component.html',
  styleUrls: ['./one-car.component.css']
})
export class OneCarComponent implements OnInit {

  constructor(private webService: WebService, private route: ActivatedRoute) { }

  ngOnInit() {
    var name = this.route.snapshot.params.id;
    this.webService.getCars(name);
  }

}
