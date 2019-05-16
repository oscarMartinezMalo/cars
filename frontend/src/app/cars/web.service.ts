import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Car } from './car.model';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Cars {
    total: number;
    pageIndex: number;
    records: Car[];
}

@Injectable()
export class WebService {

    // BASE_URL = 'http://localhost:3000/api';
    // BASE_URL = 'http://ec2-3-95-160-125.compute-1.amazonaws.com:3000/api';    
     BASE_URL = 'https://vehicleparty.com:3000/api';

    // private carStore = [];
    // private carsSubject = new Subject();
    // cars = this.carsSubject.asObservable();
    // totalRecords: number = 0;
    // pageIndex: number = 0;

    // constructor(private http: Http, private snackBar: MatSnackBar, private auth: AuthService) { }
    constructor(private http: HttpClient, private snackBar: MatSnackBar, private auth: AuthService) { }

    getOneCar(oneCar) {

        if (oneCar) {
            // This method we send the Car Id in the url eg. cars/AU8442
            // return this.http.get<Car>(this.BASE_URL + '/cars/' + oneCar,{
            // In the express server you have to implement 
            // api.get('/car/:id', authMiddleware, (req, resp) => {})
            return this.http.get<Car>(this.BASE_URL + '/car' ,{
                withCredentials: true,
                params: new HttpParams().set('id', oneCar)                                        
            })
                .pipe(
                    map(response => {                       
                        return response;
                    }),
                    catchError((errorResponse: HttpErrorResponse) => {
                    
                        let errorMessage;
                        if (errorResponse.error instanceof ErrorEvent) {
                            // A client-side or network error occurred.
                            errorMessage = `Error on your browser: ${errorResponse.error.message}`;

                        } else {
                            // The backend returned an unsuccessful response code.
                            errorMessage = errorResponse.error.message;                            
                            this.auth.logout();
                        }

                        return throwError(errorMessage);
                    })
                );
        }

    }

    getCarsPagination(page, perPage, sortByprice) {
        return this.http.get<Cars>(this.BASE_URL + '/cars/' + page + '/' + perPage + '/' + sortByprice, { withCredentials: true })
            .pipe(
                map(cars => {
                    return cars;
                }),
                catchError((errorResponse: HttpErrorResponse) => {

                    let errorMessage: string = '';
                    if (errorResponse.error instanceof ErrorEvent) {
                        // A client-side .
                        errorMessage = `Error: ${errorResponse.error.message}`;

                    } else {
                         // A Server-side
                        // errorMessage = errorResponse.message;
                        errorMessage = "Something went wrong"
                        this.auth.logout();
                    }

                    return throwError(errorMessage);
                })
            );
    }
}
