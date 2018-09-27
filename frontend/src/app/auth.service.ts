import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { Router } from "@angular/router";


@Injectable()
export class AuthService {

    BASE_URL = 'http://localhost:3000/auth';
    EMAIL_KEY = 'email';
    // TOKEN_KEY ='token';

    constructor(private http: Http, private snackBar: MatSnackBar, private router: Router) { }

    get email() {
        return localStorage.getItem(this.EMAIL_KEY);
    }
    get isAuthenticated() {
        // Check if the cookie exist if not exist detele the localStorage User and return false        
        return (!!localStorage.getItem(this.EMAIL_KEY));
    }

    // get isAuthenticated(){
    //     return (!!localStorage.getItem(this.TOKEN_KEY));
    // }

    logout() {
        localStorage.removeItem(this.EMAIL_KEY);
        // localStorage.removeItem(this.TOKEN_KEY);
        this.http.post(this.BASE_URL + '/logout', {}, {
            withCredentials: true
        }).subscribe((res) => {
            this.router.navigate(['/cars']);
        }, error => {
            this.handleError(error.message);
        });
    }

    register(user) {
        //delete user.confirmPassword;
        var response = this.http.post(this.BASE_URL + '/signup', user, {
            withCredentials: true
        }).subscribe(res => {
            this.authenticate(res);
        }, error => {
            console.log(error);
            this.handleError(error.message);
        });
    }

    login(loginData) {
        let response = this.http.post(this.BASE_URL + '/login', loginData, {
            withCredentials: true
        }).subscribe(res => {
            this.authenticate(res);
        }, error => {
            this.handleError(error.message);
        });
    }

    authenticate(res) {
        var authResponse = res.json();
        // if (authResponse.success == false){
        //     this.handleError(authResponse.message);
        // }
        //if (!authResponse.token)              
        //     return;
        //localStorage.setItem(this.TOKEN_KEY, authResponse.token);
        localStorage.setItem(this.EMAIL_KEY, authResponse.email);
        this.router.navigate(['/']);
    }

    private handleError(error) {
        this.snackBar.open(error, "close", { duration: 2000 });
    }

}

