import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
// import 'rxjs/add/operator/toPromise';


@Injectable()
export class WebService {

    constructor(private http: Http) {}

    getCars() {
         return this.http.get('http://localhost:3000/cars').toPromise();
    }
}
