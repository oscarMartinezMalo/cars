import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';
import { MatCardModule, MatButtonModule, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmValidatorDirective } from './confirm-validator.directive';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        LoginComponent,
        RegisterComponent,
        UpdateUserComponent,
        ForgotPassComponent,
        ResetPassComponent,
        ConfirmValidatorDirective
    ],
    imports: [
        CommonModule,

        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,

        AuthRoutingModule
    ]
})
export class AuthModule { }