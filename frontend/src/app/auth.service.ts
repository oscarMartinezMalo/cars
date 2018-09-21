import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { Router } from "@angular/router";

@Injectable()
export class AuthService {

    BASE_URL = 'http://localhost:3000/auth';
    EMAIL_KEY = 'email';
    TOKEN_KEY ='token';

    constructor(private http: Http, private snackBar: MatSnackBar, private router: Router ) { }

    get email(){
        return localStorage.getItem(this.EMAIL_KEY);
    }

    get isAuthenticated(){
        return (!!localStorage.getItem(this.TOKEN_KEY));
    }

    register(user) {
        //delete user.confirmPassword;

        var response = this.http.post(this.BASE_URL + '/signup', user).subscribe(res => {
            this.authenticate(res);
        }, error =>{
            console.log(error);
            this.handleError(error.message);
        });
    }

    logout(){
        localStorage.removeItem(this.EMAIL_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
    }

    login(loginData) {     
        let response = this.http.post(this.BASE_URL + '/login', loginData).subscribe(res => {
            this.authenticate(res);
        }, error =>{
            console.log(error);
            this.handleError("Unable to Login");
        });
    }

    authenticate(res){
        var authResponse = res.json();
        // if (authResponse.success == false){
        //     this.handleError(authResponse.message);
        // }
        if (!authResponse.token)              
            return;
        localStorage.setItem(this.TOKEN_KEY, authResponse.token);
        localStorage.setItem(this.EMAIL_KEY, authResponse.firstName);
        this.router.navigate(['/']);
    }

    private handleError(error) {
        this.snackBar.open(error, "close", {duration: 2000});
    }

}

