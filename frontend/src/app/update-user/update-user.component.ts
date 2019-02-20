import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {

  formName;
  formPassword;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.formName = fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.formPassword = fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(3)]],
      newPassword: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required]]
    })
    console.log(this.formPassword);
  }

  ngOnInit() {
    this.auth.getUserInfo();
    this.auth.userCompName.subscribe(resp => {
      this.formName.setValue(resp);
    })
  }

  isValid(control) {
    let formToValidate;
    if (String(control).includes("Password"))
      formToValidate = this.formPassword;
    else
      formToValidate = this.formName;

    return (formToValidate.controls[control].invalid && formToValidate.controls[control].touched);
  }

  updateName() {
    if (this.formName.valid) {
      this.auth.updateUserInfo(this.formName.value);
    }
  }

  updatePassword() {
    if (this.formPassword.valid) {
      this.auth.updatePassword(this.formPassword.value);
      this.formPassword.reset();
    }
  }

}
