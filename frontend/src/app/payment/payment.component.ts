import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {

  paypalForm;

  constructor(private fb: FormBuilder, private auth: AuthService, private snackBar: MatSnackBar) {
    this.paypalForm = fb.group({
      amount: ['', [Validators.required, Validators.max(99), Validators.min(1)]]
    });

  }

  pay() {
    if (this.paypalForm.valid) {
      this.auth.paypalPay(this.paypalForm.value);
      this.paypalForm.reset();      
      this.snackBar.open("Paypal is going to load in a new page", "close", { duration: 3000 });
    }
  }

}
