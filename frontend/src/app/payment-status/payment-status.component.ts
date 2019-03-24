import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.css']
})
export class PaymentStatusComponent implements OnInit {

   

  constructor(private route: ActivatedRoute) { }

  paymentStatus= false;

  ngOnInit() {
      this.route.snapshot.params.status == "success" ? this.paymentStatus = true : this.paymentStatus = false ;
  }

}
