import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentComponent } from './payment/payment.component';
import { PaymentStatusComponent } from './payment-status/payment-status.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatCardModule, MatTooltipModule } from '@angular/material';

@NgModule({
    declarations: [
        PaymentComponent,
        PaymentStatusComponent
    ],
    imports: [
        CommonModule,
        
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatCardModule,
        MatTooltipModule
    ]
})
export class PaymentModule { }