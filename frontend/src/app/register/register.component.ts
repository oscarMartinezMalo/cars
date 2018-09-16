import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from '../auth.service';
// import { FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from "@angular/forms";
// import {ErrorStateMatcher} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//     const isSubmitted = form && form.submitted;
//     return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
//   }
// }

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  // emailFormControl = new FormControl('', [
  //   Validators.required,
  //   Validators.email,
  // ]);

  // matcher = new MyErrorStateMatcher();

  form;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, this.emailValid()]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    },
      {
        validator: (form) => {
          if (form.controls['password'].value !== form.controls['confirmPassword'].value)
            return { mismatchedFields: true };
        }
      })
  }

  ngOnInit() {
  }

  onSubmit() {
    // console.log(this.form.value);
    // console.log(this.form.errors);
    this.auth.register(this.form.value);
  }

  isValid(control) {
    return (this.form.controls[control].invalid && this.form.controls[control].touched)
  }

  emailValid() {
    return control => {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      return regex.test(control.value) ? null : { invalidEmail: true }
    }
  }

}
