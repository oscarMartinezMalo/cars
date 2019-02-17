import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { Router } from "@angular/router";
import { Subject } from 'rxjs';


@Injectable()
export class AuthService {

    BASE_URL = 'http://localhost:3000/auth';
    // BASE_URL = 'http://ec2-3-95-160-125.compute-1.amazonaws.com:3000/auth';

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
            this.handleMessages(error);
        });
    }

    register(user) {
        //delete user.confirmPassword;
        var response = this.http.post(this.BASE_URL + '/signup', user, {
            withCredentials: true
        }).subscribe(res => {
            this.authenticate(res);
        }, error => {
            this.handleMessages(error);
        });
    }

    login(loginData) {
        let response = this.http.post(this.BASE_URL + '/login', loginData, {
            withCredentials: true
        }).subscribe(res => {
            this.authenticate(res);
        }, error => {
            this.handleMessages(error);
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
            this.logout(); // If not logged go and delete the localStorage User 
            this.handleMessages(error);
        });
    }

    updateUserInfo(userInfo) {
        let response = this.http.post(this.BASE_URL + '/updateName', userInfo, {
            withCredentials: true
        }).subscribe(res => {            
            this.handleMessages(res);
        }, error => {
            this.logout(); // If not logged go and delete the localStorage User 
            this.handleMessages(error);
        });
    }

    updatePassword(passWordInfo) {
        let response = this.http.post(this.BASE_URL + '/updatePassword', passWordInfo, {
            withCredentials: true
        }).subscribe(res => {
            this.handleMessages(res);
        }, error => {
            //Ask if the session was wrong in that case execute logout otherwise dont logioout
            // this.logout(); // If not logged go and delete the localStorage User 
            this.handleMessages(error);
        });
    }

    sendResetEmail(emailReset){
        let response = this.http.post(this.BASE_URL + '/resetpasswordEmail', emailReset, {
            withCredentials: true
        }).subscribe(res => {
            this.handleMessages(res);
            this.router.navigate(['/']);
        }, error => {
            this.handleMessages(error);
        });
    }

    forgotPasswordtoken(tokenPassword){
        let response = this.http.post(this.BASE_URL + '/forgotPassword', tokenPassword, {
            withCredentials: true
        }).subscribe(res => {
            this.handleMessages(res);
            this.router.navigate(['/login']);
        }, error => {
            this.handleMessages(error);
            this.router.navigate(['/']);   
        });
    }

    private handleMessages(error) {
        let messageResp = error.json();
        let message;
        if(messageResp.succeed)
            message = messageResp.succeed;
        else
            message = messageResp.error.message;
        this.snackBar.open(message, "close", { duration: 2000 });
    }

}

