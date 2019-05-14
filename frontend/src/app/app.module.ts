import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModude } from './app-routing.module';
import { ErrorPageComponent } from './error-page/error-page.component';

// My Modules
import { CarsModule } from './cars/cars.module';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './paypal-payment/payment.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    HttpModule,
    HttpClientModule,
    MatSnackBarModule,

    CarsModule,
    PaymentModule,    
    AuthModule,
    AppRoutingModude,
    CoreModule
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
