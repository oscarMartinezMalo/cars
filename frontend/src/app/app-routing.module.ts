import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MainNavComponent } from "./main-nav/main-nav.component";
import { PaymentStatusComponent } from "./payment-status/payment-status.component";
import { PaymentComponent } from "./payment/payment.component";
import { ResetPassComponent } from "./reset-pass/reset-pass.component";
import { ForgotPassComponent } from "./forgot-pass/forgot-pass.component";
import { UpdateUserComponent } from "./update-user/update-user.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { OneCarComponent } from "./cars/one-car/one-car.component";
import { CarsComponent } from "./cars/cars.component";
import { AuthGuard } from "./auth-guard.service";
import { CanDeactivateGuard } from "./update-user/can-deactivate-guard";
import { ErrorPageComponent } from "./error-page/error-page.component";


const appRoutes: Routes = [
  // This is gonna load the data on a the same page Using <router-outler>
  // {
  //   path: 'cars', component: CarsComponent, children: [
  //     { path: ':id', component: OneCarComponent }
  //   ]
  // },
  { path: '', redirectTo: '/cars', pathMatch: 'full' },
  { path: 'cars', component: CarsComponent },  // This is gonna load the data on a new Page
  { path: 'cars/:id', canActivate: [AuthGuard], component: OneCarComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'update', canActivate: [AuthGuard], component: UpdateUserComponent, canDeactivate: [CanDeactivateGuard] }, // Ask the user if he wanna leave the page before make changes
  { path: 'forgotpass', component: ForgotPassComponent },
  { path: 'resetpass/:token', component: ResetPassComponent },
  { path: 'payment', canActivate: [AuthGuard], component: PaymentComponent },
  { path: 'payment/:status', canActivate: [AuthGuard], component: PaymentStatusComponent },
  { path: 'home', component: MainNavComponent },
  { path: 'not_found', component: ErrorPageComponent, data: { message: 'Page not Found' } },
  { path: '**', redirectTo: '/not_found' }
];

@NgModule({
  imports: [
    // Location Strategies you can configurate the webhost to render index.html in case that does found the page and set useHash: false
    // This configuration you can do it to in   app.module ans set the location strategy
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModude {


}