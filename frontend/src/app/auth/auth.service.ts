import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, Observable } from 'rxjs';


@Injectable()
export class AuthService {

    // BASE_URL = 'http://localhost:3000/auth';
    // BASE_URL = 'https://ec2-3-95-160-125.compute-1.amazonaws.com:3000/auth';
    BASE_URL = 'https://vehicleparty.com:3000/auth';

    EMAIL_KEY = 'email';
    // TOKEN_KEY ='token';

    private userCompleteName = [];
    private userCompleteNameSubj = new Subject();
    userCompName = this.userCompleteNameSubj.asObservable();
    loggedIn: boolean = false;

    get completeName() {
        return this.userCompleteName;
    }

    constructor(private http: Http,
                private snackBar: MatSnackBar,
                private router: Router,
                private route: ActivatedRoute) { }

    get email() {
        return localStorage.getItem(this.EMAIL_KEY);
    }
    
    get isAuthenticated() {             
        // Check if the cookie exist if not exist, delete the localStorage User and return false  
        return (!!localStorage.getItem(this.EMAIL_KEY)); // Double Bang !! used to convert the value return in to a boolean   
    }

    logout() {
        localStorage.removeItem(this.EMAIL_KEY);
        // localStorage.removeItem(this.TOKEN_KEY);
        this.http.post(this.BASE_URL + '/logout', {}, {
            withCredentials: true
        }).subscribe((res) => { 
            this.router.navigate(['/']);       
        }, error => {
            this.handleMessages(error);
        });
    }

    register(user) {
        // Delete user.confirmPassword;
        var response = this.http.post(this.BASE_URL + '/signup', user, {
            withCredentials: true
        }).subscribe(res => {
            this.setLocalKeyAutentication(res);
        }, error => {
            this.handleMessages(error);
        });
    }

    login(loginData){
        let response = this.http.post(this.BASE_URL + '/login', loginData, {
            withCredentials: true
        }).subscribe(res => {
            this.setLocalKeyAutentication(res);
        }, error => {
            this.handleMessages(error);
        });
        return response;
    }

    setLocalKeyAutentication(res) {
        var authResponse = res.json();
        localStorage.setItem(this.EMAIL_KEY, authResponse.email);
        this.router.navigate(['/cars']);
    }

    getUserInfo() {
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
            this.logout(); // If not logged go and delete the localStorage User 
            this.handleMessages(error);
        });
        this.router.navigate(['../'], {relativeTo: this.route});
    }

    sendResetEmail(emailReset) {
        let response = this.http.post(this.BASE_URL + '/resetpasswordEmail', emailReset, {
            withCredentials: true
        }).subscribe(res => {
            this.handleMessages(res);
            this.router.navigate(['/']);
        }, error => {
            this.logout(); // If not logged go and delete the localStorage User 
            this.handleMessages(error);
        });
    }

    forgotPasswordtoken(tokenPassword) {
        let response = this.http.post(this.BASE_URL + '/forgotPassword', tokenPassword, {
            withCredentials: true
        }).subscribe(res => {
            this.handleMessages(res);
            this.router.navigate(['/login']);
        }, error => {
            this.logout(); // If not logged go and delete the localStorage User 
            this.handleMessages(error);
        });
    }

    private handleMessages(error) {
        let messageResp = error.json();
        let message;

        if (messageResp.succeed){
            message = messageResp.succeed;
        }
        else{
            message = messageResp.error.message;
        }

        this.snackBar.open(message, "Close", { duration: 3000 });
    }

}

