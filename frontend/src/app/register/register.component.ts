import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, this.emailValid()]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required]]
    }
      // Custom Validator but in this case I created a custom directive 
      // to do the password match validation
      // ,
      //   {
      //     validator: (form) => {
      //       if (form.controls['password'].value !== form.controls['confirmPassword'].value)
      //         return { mismatchedFields: true };
      //     }
      //   }
    )
  }

  ngOnInit() {
  }

  onSubmit() {
    // console.log(this.form.get("confirmPassword").errors );
    if (this.form.valid) {
      this.auth.register(this.form.value);
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
