import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subject, throwError } from 'rxjs';
import { AuthService } from '../app/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Car } from './Car';
import { catchError } from 'rxjs/operators';

export class Cars {
    total: number;
    pageIndex: number;
    records: Car[];
}

@Injectable()
export class WebService {

    BASE_URL = 'http://localhost:3000/api';
    // BASE_URL = 'http://ec2-3-95-160-125.compute-1.amazonaws.com:3000/api';    
    // BASE_URL = 'https://vehicleparty.com:3000/api';

    // private carStore = [];
    // private carsSubject = new Subject();
    // cars = this.carsSubject.asObservable();
    // totalRecords: number = 0;
    // pageIndex: number = 0;

    // constructor(private http: Http, private snackBar: MatSnackBar, private auth: AuthService) { }
    constructor(private http: HttpClient, private snackBar: MatSnackBar, private auth: AuthService) { }

    getOneCar(oneCar) {

        // if (oneCar) {
        //     oneCar = '/' + oneCar;
        //     var res = this.http.get(this.BASE_URL + '/cars' + oneCar, { withCredentials: true }).subscribe((res) => {
        //         this.carStore = res.json();
        //         this.carsSubject.next(this.carStore);
        //     }, error => {

        //         this.auth.logout(); // If not logged go and delete the localStorage User 
        //         this.handleError("Please login first");
        //     });
        // }

        if (oneCar) {          
            return this.http.get<Car>(this.BASE_URL + '/cars/' + oneCar, { withCredentials: true })
                .pipe(
                    catchError(this.handleError)
                );
        }

    }

    // }

    // getCarsPagination(page, perPage, sortByprice) {
    //     console.log(sortByprice);
    //     // var res = this.http.get(this.BASE_URL + '/cars/' + page + '/' + perPage + '/' + sortByprice, { withCredentials: true }).subscribe((res) => {
    //         var res = this.http.get(this.BASE_URL + '/cars/' + page + '/' + perPage + '/' + sortByprice, { withCredentials: true }).subscribe((res) => {
    //         this.carStore = res.json().records;
    //         this.totalRecords = res.json().total;
    //         this.pageIndex = res.json().pageIndex;
    //         this.carsSubject.next(this.carStore);
    //     }, error => {
    //         //this.handleError(error);                
    //         this.auth.logout(); // If not logged go and delete the localStorage User 
    //         this.handleError("Please login first");
    //     });
    // }

    getCarsPagination(page, perPage, sortByprice) {
        return this.http.get<Cars>(this.BASE_URL + '/cars/' + page + '/' + perPage + '/' + sortByprice, { withCredentials: true })
            .pipe(
                catchError(this.handleError)
            );
    }

    // private handleError(error: HttpErrorResponse) {
    // this.snackBar.open(error, "close", { duration: 6000 });

    private handleError(error: HttpErrorResponse) {
        
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
            
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            let errorMessage ="Backend returned code ${error.status}, " + "body was: ${error.error}";
        }
        this.auth.logout();
        // return an observable with a user-facing error message
        return throwError(
            'Something bad happened; please try again later.');
    };

}
