import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth-guard.service";

import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";
import { UpdateUserComponent } from "./update-user/update-user.component";
import { CanDeactivateGuard } from "./update-user/can-deactivate-guard";
import { ForgotPassComponent } from "./forgot-pass/forgot-pass.component";
import { ResetPassComponent } from "./reset-pass/reset-pass.component";


const authRoutes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'update', canActivate: [AuthGuard], component: UpdateUserComponent, canDeactivate: [CanDeactivateGuard] }, // Ask the user if he wanna leave the page before make changes
    { path: 'forgotpass', component: ForgotPassComponent },
    { path: 'resetpass/:token', component: ResetPassComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(authRoutes)
    ],
    exports: [RouterModule],
    providers: [
        AuthGuard,
        CanDeactivateGuard
    ]
})
export class AuthRoutingModule { }