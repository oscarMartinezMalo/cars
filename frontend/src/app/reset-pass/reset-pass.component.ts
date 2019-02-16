import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { tokenKey } from '@angular/core/src/view';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit {

  formPassword;

  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute) {

    this.formPassword = fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  ngOnInit(  ) {

  }

  isValid(control) {
    let formToValidate;
    if (String(control).includes("Password"))
      formToValidate = this.formPassword;

    return (formToValidate.controls[control].invalid && formToValidate.controls[control].touched);
  }

  updatePassword() {
    this.formPassword.addControl('token', new FormControl(this.route.snapshot.params.token, Validators.required));

    if (this.formPassword.valid) {
      this.auth.forgotPasswordtoken(this.formPassword.value);         
    }
  }

}
