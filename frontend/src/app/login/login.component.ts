import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private auth: AuthService) { }

  loginData = {
    email: 'titi@titi.com',
    password: 'tititi'
  }
  login(){
    this.auth.login(this.loginData);
  }
  ngOnInit() {
  }

}
