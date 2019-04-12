import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CanComponentDeactivate } from './can-deactivate-guard';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit, CanComponentDeactivate {

  formName;
  formPassword;
  nameUpdated: boolean = false;
  firstNameInit = '';
  lastNameInit ='';

  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
    this.formName = fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.formPassword = fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(3)]],
      newPassword: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required]]
    })

  }

  ngOnInit() {
    this.auth.getUserInfo();
    this.auth.userCompName.subscribe(resp => {
      this.formName.setValue(resp);
      this.firstNameInit = this.formName.controls.firstName.value;
      this.lastNameInit = this.formName.controls.lastName.value;
    });
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
    this.nameUpdated = true;
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  updatePassword() {
    if (this.formPassword.valid) {
      this.auth.updatePassword(this.formPassword.value);
      this.formPassword.reset();
    }
  }

  // Show alert before leave the update page if a change was made and not updated the form
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {

    if ((this.firstNameInit !== this.formName.controls.firstName.value || this.lastNameInit !== this.formName.controls.lastName.value) && !this.nameUpdated) {
      return confirm('Do you want to discard the changes?');
    } else {
      return true;
    }

  }

}
