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
import { OneCarComponent } from "./one-car/one-car.component";
import { CarsComponent } from "./cars/cars.component";
import { AuthGuard } from "./auth-guard.service";
import { CanDeactivateGuard } from "./update-user/can-deactivate-guard";


const appRoutes: Routes = [
    { path: '', component: CarsComponent },
    { path: 'cars', component: CarsComponent },
    { path: 'cars/:id', component: OneCarComponent },
    { path: 'register', canActivate:[AuthGuard], component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'update', component: UpdateUserComponent, canDeactivate: [CanDeactivateGuard] },
    { path: 'forgotpass', component: ForgotPassComponent },
    { path: 'resetpass/:token', component: ResetPassComponent },
    { path: 'payment', component: PaymentComponent },
    { path: 'payment/:status', component: PaymentStatusComponent },
    { path: 'home', component: MainNavComponent },
    { path: '**', redirectTo: 'cars' }
  ];

@NgModule({
    imports: [        
    RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModude{


}