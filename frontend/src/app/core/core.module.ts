import { NgModule } from '@angular/core';

import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModude } from '../app-routing.module';

import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatMenuModule, MatToolbarModule } from '@angular/material';

//Services
import { CookieService } from 'ngx-cookie-service';
//My services
import { WebService } from '../cars/web.service';
import { AuthService } from '../auth/auth.service';
import { PaypalService } from '../paypal-payment/paypal.service';

//My AuthGuard and DeactivedGuard
import { AuthGuard } from '../auth/auth-guard.service';
import { CanDeactivateGuard } from '../auth/update-user/can-deactivate-guard';

import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        NavComponent,
        HomeComponent
    ],
    imports: [
        CommonModule,

        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,

        AppRoutingModude
    ],
    exports: [
        AppRoutingModude,
        NavComponent
    ],
    providers: [
        WebService,
        AuthService,
        PaypalService,
        AuthGuard,
        CanDeactivateGuard,
        CookieService
    ]
})

export class CoreModule { }