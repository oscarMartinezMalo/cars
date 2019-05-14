import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { OneCarComponent } from "./one-car/one-car.component";
import { AuthGuard } from "../auth/auth-guard.service";
import { CarsComponent } from "./cars.component";


const carsRoutes: Routes = [
    { path: 'cars', component: CarsComponent },  // This is gonna load the data on a new Page
    { path: 'cars/:id', canActivate: [AuthGuard], component: OneCarComponent }
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