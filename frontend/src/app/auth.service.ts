import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { Router } from "@angular/router";
import { Subject } from 'rxjs';


@Injectable()
export class AuthService {

    BASE_URL = 'http://localhost:3000/auth';
    EMAIL_KEY = 'email';
    // TOKEN_KEY ='token';

    private userCompleteName = [];
    private userCompleteNameSubj = new Subject();
    userCompName = this.userCompleteNameSubj.asObservable();

    get completeName(){
        return this.userCompleteName;
    }

    constructor(private http: Http, private snackBar: MatSnackBar, private router: Router) { }

    get email() {
        return localStorage.getItem(this.EMAIL_KEY);
    }

    get isAuthenticated() {
        // Check if the cookie exist if not exist detele the localStorage User and return false        
        return (!!localStorage.getItem(this.EMAIL_KEY));
    }

    logout() {
        localStorage.removeItem(this.EMAIL_KEY);
        // localStorage.removeItem(this.TOKEN_KEY);
        this.http.post(this.BASE_URL + '/logout', {}, {
            withCredentials: true
        }).subscribe((res) => {
            this.router.navigate(['/cars']);
        }, error => {
            this.handleError(error);
        });
    }

    register(user) {
        //delete user.confirmPassword;
        var response = this.http.post(this.BASE_URL + '/signup', user, {
            withCredentials: true
        }).subscribe(res => {
            this.authenticate(res);
        }, error => {
            this.handleError(error);
        });
    }

    login(loginData) {
        let response = this.http.post(this.BASE_URL + '/login', loginData, {
            withCredentials: true
        }).subscribe(res => {
            this.authenticate(res);
        }, error => {
            this.handleError(error);
        });
    }

    authenticate(res) {
        var authResponse = res.json();
        localStorage.setItem(this.EMAIL_KEY, authResponse.email);
        this.router.navigate(['/']);
    }

    getUserInfo(){
        let response = this.http.get(this.BASE_URL + '/getUserInfo', {
            withCredentials: true
        }).subscribe(res => {     
         
            this.userCompleteName = res.json()[0];
            this.userCompleteNameSubj.next(this.userCompleteName);
        }, error => {
            this.handleError(error);
        });
    }

    updateUserInfo(userInfo) {
        let response = this.http.post(this.BASE_URL + '/updateName', userInfo, {
            withCredentials: true
        }).subscribe(res => {
            // Name change Successfully
            console.log(res.json());
        }, error => {
            this.handleError(error);
        });
    }

    updatePassword(passWordInfo) {
        let response = this.http.post(this.BASE_URL + '/updatePassword', passWordInfo, {
            withCredentials: true
        }).subscribe(res => {
            //Message (Password change successfully)
        }, error => {
            this.handleError(error);
        });
    }


    private handleError(error) {
        let message = JSON.parse(error._body).error.message;
        this.snackBar.open(message, "close", { duration: 2000 });
    }

}

