import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  constructor(private auth: AuthService) { }

  pay(){
    this.auth.paypalPay();
  }

}
