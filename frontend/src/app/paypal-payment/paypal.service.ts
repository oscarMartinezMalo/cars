import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Payment } from './payment.model';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PaypalService {

    BASE_URL = 'http://localhost:3000/auth';
    // BASE_URL = 'https://vehicleparty.com:3000/auth';

    constructor(private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService) { }



    paypalPay(paymentProduct) {

        return this.http.post<Payment>(this.BASE_URL + '/pay', paymentProduct, {
            withCredentials: true
        }).pipe(           
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
        )
       
    }

}

