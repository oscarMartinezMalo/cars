import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';

@Injectable()
export class WebService {

    BASE_URL = 'http://localhost:3000/api';

    private carStore = [];
    private carsSubject = new Subject();
    cars = this.carsSubject.asObservable();

    constructor( private http: Http, private snackBar: MatSnackBar) {}

    getCars(oneCar) {        
            oneCar = (oneCar) ? '/' + oneCar : '';
            var response = this.http.get(this.BASE_URL + '/cars' + oneCar, { withCredentials: true }).subscribe(response => {
                this.carStore = response.json();
                this.carsSubject.next(this.carStore);
            }, error =>{
                //this.handleError(error);
                this.handleError("You have to be logged to see beyond the walls");
            });
    }

    private handleError(error) {
        this.snackBar.open(error, "close", {duration: 2000});
    }

}
