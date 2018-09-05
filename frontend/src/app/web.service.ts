import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class WebService {

    BASE_URL = 'http://localhost:3000/api';

    cars = [];

    constructor( private http: Http, private snackBar: MatSnackBar) {
        this.getCars();
    }

    // async getCars() {

    //     try {
    //         var response = await this.http.get(this.BASE_URL + '/cars').toPromise();
    //         this.cars = response.json();
    //     } catch (error) {
    //         this.handleError("Unable to get Car List");
    //     }
    // }

    getCars(oneCar) {

            oneCar = (oneCar) ? '/' + oneCar : '';
            var response = this.http.get(this.BASE_URL + '/cars' + oneCar).subscribe(response =>{
                this.cars = response.json();
            }, error =>{
                this.handleError("Unable to get Car List");
            });
    }

    // postCar(car) {
    //     return this.http.post(this.BASE_URL + '/cars', car).toPromise();
    // }

    private handleError(error) {
        this.snackBar.open(error, "close", {duration: 2000});
    }

}
