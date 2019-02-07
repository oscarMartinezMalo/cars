import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit {

  formPassword;

  constructor(private fb: FormBuilder, private auth: AuthService) {

    this.formPassword = fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  ngOnInit() {
  }

  isValid(control) {
    let formToValidate;
    if (String(control).includes("Password"))
      formToValidate = this.formPassword;

    return (formToValidate.controls[control].invalid && formToValidate.controls[control].touched);
  }

  updatePassword() {
    if (this.formPassword.valid) {
          //this.auth.updatePassword(this.formPassword.value);
         // this.formPassword.reset();
         alert("New Pass");
    }
  }

}
