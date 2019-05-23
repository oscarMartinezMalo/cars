import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// import { MainNavComponent } from "./main-nav/main-nav.component";
import { PaymentStatusComponent } from "./paypal-payment/payment-status/payment-status.component";
import { PaymentComponent } from "./paypal-payment/payment/payment.component";
// import { ResetPassComponent } from "./auth/reset-pass/reset-pass.component";
// import { ForgotPassComponent } from "./auth/forgot-pass/forgot-pass.component";
// import { UpdateUserComponent } from "./auth/update-user/update-user.component";
// import { LoginComponent } from "./auth/login/login.component";
// import { RegisterComponent } from "./auth/register/register.component";
// import { OneCarComponent } from "./cars/one-car/one-car.component";
// import { CarsComponent } from "./cars/cars.component";
import { AuthGuard } from "./auth/auth-guard.service";
// import { CanDeactivateGuard } from "./auth/update-user/can-deactivate-guard";
import { ErrorPageComponent } from "./error-page/error-page.component";
import { HomeComponent } from "./core/home/home.component";


const appRoutes: Routes = [
  // This is gonna load the data on a the same page Using <router-outler>
  // {
  //   path: 'cars', component: CarsComponent, children: [
  //     { path: ':id', component: OneCarComponent }
  //   ]
  // },
  // { path: '', redirectTo: '/cars', pathMatch: 'full' },
  // { path: 'cars', component: CarsComponent },  // This is gonna load the data on a new Page
  // { path: 'cars/:id', canActivate: [AuthGuard], component: OneCarComponent },
  // { path: 'register', component: RegisterComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'update', canActivate: [AuthGuard], component: UpdateUserComponent, canDeactivate: [CanDeactivateGuard] }, // Ask the user if he wanna leave the page before make changes
  // { path: 'forgotpass', component: ForgotPassComponent },
  // { path: 'resetpass/:token', component: ResetPassComponent },
  { path: '', component: HomeComponent},
  { path: 'cars', loadChildren: './cars/cars.module#CarsModule'},
  { path: 'payment', canActivate: [AuthGuard], component: PaymentComponent },
  { path: 'payment/:status', canActivate: [AuthGuard], component: PaymentStatusComponent },
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