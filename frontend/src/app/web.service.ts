import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import { AuthService } from '../app/auth.service';

@Injectable()
export class WebService {

    // BASE_URL = 'http://localhost:3000/api';
    // BASE_URL = 'http://ec2-3-95-160-125.compute-1.amazonaws.com:3000/api';    
    BASE_URL = 'https://vehicleparty.com:3000/api';

    private carStore = [];
    private carsSubject = new Subject();
    cars = this.carsSubject.asObservable();
    totalRecords: number = 0;
    pageIndex: number = 0;

    constructor(private http: Http, private snackBar: MatSnackBar, private auth: AuthService) { }

    getOneCar(oneCar) {

        if (oneCar) {
            oneCar = '/' + oneCar;
            console.log(oneCar);
            var res = this.http.get(this.BASE_URL + '/cars' + oneCar, { withCredentials: true }).subscribe((res) => {
                this.carStore = res.json();
                this.carsSubject.next(this.carStore);
            }, error => {
           
                this.auth.logout(); // If not logged go and delete the localStorage User 
                this.handleError("Please login first");
            });
        }

    }

    getCarsPagination(page, perPage) {

        var res = this.http.get(this.BASE_URL + '/cars/' + page + '/' + perPage, { withCredentials: true }).subscribe((res) => {
            this.carStore = res.json().records;
            this.totalRecords = res.json().total;
            this.pageIndex = res.json().pageIndex;
            this.carsSubject.next(this.carStore);
        }, error => {
            //this.handleError(error);                
            this.auth.logout(); // If not logged go and delete the localStorage User 
            this.handleError("Please login first");
        });
    }

    private handleError(error) {
        this.snackBar.open(error, "close", { duration: 6000 });
    }

} 
