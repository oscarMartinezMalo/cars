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

  form;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = fb.group({
      email: ['', [Validators.required, this.emailValid()]]
    })
   }

  ngOnInit() {
  }

  onSubmit() {
    // console.log(this.form.get("confirmPassword").errors );
    if (this.form.valid) {
      console.log(this.form.value.email);
    }
  }

  isValid(control) {
    return (this.form.controls[control].invalid && this.form.controls[control].touched);
  }

  emailValid() {
    return control => {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return regex.test(control.value) ? null : { invalidEmail: true }
    }
  }

}
