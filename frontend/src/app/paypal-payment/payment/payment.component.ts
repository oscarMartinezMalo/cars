import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material';
import { PaypalService } from '../paypal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {

  paypalForm;

  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private paypal: PaypalService,
    private router: Router) {
    this.paypalForm = fb.group({
      amount: ['', [Validators.required, Validators.max(99), Validators.min(1)]]
    });

  }

  pay() {
    if (this.paypalForm.valid) {
      this.snackBar.open("Paypal is going to load in a new page", "close", { duration: 2000 });

      this.paypal.paypalPay(this.paypalForm.value).
        subscribe(res => {
          if (window.open(res.paypalUrl, "_blank") == null) {
            alert("Please desactive the popup blocker");
          }
        }, (error) => {
          this.openSnackBar(error)
        });

      this.paypalForm.reset();
    }
  }

  openSnackBar(error) {
    this.router.navigate(['/cars']);
    this.snackBar.open(error, "close", { duration: 6000 });
  }

}
