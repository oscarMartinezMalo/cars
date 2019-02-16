import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { BrowserModule } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebService } from './web.service';
import { AuthService } from "./auth.service";
import { HttpModule } from '@angular/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { CarFilterPipe } from './car-filter.pipe';
import { CarsComponent } from './cars/cars.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home.component';
import { OneCarComponent } from './one-car/one-car.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { ConfirmValidatorDirective } from "./ConfirmValidatorDirective";
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';

var routes = [{
  path: '',
  component: HomeComponent,
},
{
  path: 'cars',
  component: CarsComponent,
},
{
  path: 'cars/:id',
  component: OneCarComponent
}
  ,
{
  path: 'register',
  component: RegisterComponent
},
{
  path: 'login',
  component: LoginComponent
},
{
  path: 'update',
  component: UpdateUserComponent
},
{
  path: 'forgotpass',
  component: ForgotPassComponent
}
,
{
  path: 'resetpass/:token',
  component: ResetPassComponent
}
];

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
    ConfirmValidatorDirective,
    ForgotPassComponent,
    ResetPassComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HttpModule,
    MatSnackBarModule,
    MatMenuModule,
    MatToolbarModule,
    RouterModule.forRoot(routes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
  ],
  providers: [WebService, AuthService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
