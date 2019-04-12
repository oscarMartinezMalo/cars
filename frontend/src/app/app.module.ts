import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebService } from './web.service';
import { AuthService } from "./auth.service";
import { HttpModule } from '@angular/http';

import { CookieService } from 'ngx-cookie-service';

import { MatButtonModule, MatIconModule, MatCheckbox } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatListModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppComponent } from './app.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { CarFilterPipe } from './car-filter.pipe';
import { CarsComponent } from './cars/cars.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home.component';
import { OneCarComponent } from './one-car/one-car.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { ConfirmValidatorDirective } from "./ConfirmValidatorDirective";
import { PaymentComponent } from "./payment/payment.component";
import { PaymentStatusComponent } from './payment-status/payment-status.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModude } from './app-routing.module';
import { AuthGuard } from './auth-guard.service';
import { CanDeactivateGuard } from './update-user/can-deactivate-guard';
import { ErrorPageComponent } from './error-page/error-page.component';

@NgModule({
  declarations: [
    AppComponent,
    CarsComponent,
    CarFilterPipe,
    NavComponent,
    HomeComponent,
    OneCarComponent,
    RegisterComponent,
    LoginComponent,
    UpdateUserComponent,
    ForgotPassComponent,
    ResetPassComponent,
    ConfirmValidatorDirective,
    PaymentComponent,
    PaymentStatusComponent,
    MainNavComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HttpModule,
    HttpClientModule,
    MatSnackBarModule,
    MatMenuModule,
    MatToolbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatGridListModule,
    MatSelectModule,
    MatSidenavModule,
    MatCheckboxModule,
    LayoutModule,
    MatListModule,
    AppRoutingModude
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, WebService, AuthService, AuthGuard, CanDeactivateGuard, CookieService],
  // Used HTML5 PathLocationStrategy when you configured
  // web server to serve /index.html for any incoming request, no matter what the path is.
  // providers: [{provide: APP_BASE_HREF, useValue: '/my/app'},WebService, AuthService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
