import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { Router } from "@angular/router";

@Injectable()
export class AuthService {

    BASE_URL = 'http://localhost:3000/auth';
    NAME_KEY = 'name';
    TOKEN_KEY ='token';

    constructor(private http: Http, private snackBar: MatSnackBar, private router: Router ) { }

    get name(){
        return localStorage.getItem(this.NAME_KEY);
    }

    get isAuthenticated(){
        return (!!localStorage.getItem(this.TOKEN_KEY));
    }

    register(user) {
        delete user.confirmPassword;
        var response = this.http.post(this.BASE_URL + '/register', user).subscribe(res => {
            this.authenticate(res);
        }, error =>{
            this.handleError("Unable to created User");
        });
    }

    logout(){
        localStorage.removeItem(this.NAME_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
    }

    login(loginData) {     
        let response = this.http.post(this.BASE_URL + '/login', loginData).subscribe(res => {
            this.authenticate(res);
        }, error =>{
            this.handleError("Unable to Login");
        });
    }

    authenticate(res){
        var authResponse = res.json();
        console.log(res);
        if (!authResponse.token)              
            return;
        // console.log(res.json());
        localStorage.setItem(this.TOKEN_KEY, authResponse.token);
        localStorage.setItem(this.NAME_KEY, authResponse.firstName);
        this.router.navigate(['/']);
    }

    private handleError(error) {
        this.snackBar.open(error, "close", {duration: 2000});
    }

}

