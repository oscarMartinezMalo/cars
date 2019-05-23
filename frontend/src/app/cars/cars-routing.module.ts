import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { OneCarComponent } from "./one-car/one-car.component";
import { AuthGuard } from "../auth/auth-guard.service";
import { CarsComponent } from "./cars.component";


const carsRoutes: Routes = [
    //This path is remark because Im gonna use Lazy Loading in the app-routing.module
  //  { path: 'cars', component: CarsComponent },  // This is gonna load the data on a new Page
    { path: '' , component: CarsComponent, canActivateChild: [AuthGuard] , children: [
         { path: ':id', component: OneCarComponent}
    ]}
    // { path: 'cars/:id', canActivate: [AuthGuard], component: OneCarComponent }
    // { path: ':id', component: OneCarComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [
        RouterModule.forChild(carsRoutes)
    ],
    exports: [RouterModule],
    providers: [
        AuthGuard
    ]
})
export class CarsRoutingModule { }