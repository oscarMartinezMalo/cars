import { Component, OnInit } from '@angular/core';
import { embeddedViewEnd } from '@angular/core/src/render3/instructions';
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css']
})
export class ForgotPassComponent implements OnInit {

  formForgotPass;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.formForgotPass = fb.group({
      email: ['', [Validators.required, this.emailValid()]]
    })
   }

  ngOnInit() {
  }

  sendEmail() {
    // console.log(this.form.get("confirmPassword").errors );
    if (this.formForgotPass.valid) {
      this.auth.sendResetEmail(this.formForgotPass.value);
    }
  }

  isValid(control) {
    return (this.formForgotPass.controls[control].invalid && this.formForgotPass.controls[control].touched);
  }

  emailValid() {
    return control => {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return regex.test(control.value) ? null : { invalidEmail: true }
    }
  }

}
