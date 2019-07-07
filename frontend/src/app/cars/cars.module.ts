import { NgModule } from '@angular/core';
import { MatCardModule, MatSelectModule, MatPaginatorModule, MatButtonModule, MatInputModule, MatIconModule } from '@angular/material';
import { MatSidenavModule } from '@angular/material';
import { CommonModule } from '@angular/common';

import { CarsComponent } from './cars.component';
import { CarDetailComponent } from './car-detail/car-detail.component';
import { OneCarComponent } from './one-car/one-car.component';
import { CarFilterPipe } from './car-filter.pipe';
import { FormsModule } from '@angular/forms';

import { CarsRoutingModule } from './cars-routing.module';


@NgModule({
    declarations: [
        CarsComponent,
        CarDetailComponent,
        OneCarComponent,
        CarFilterPipe
    ],
    imports: [
        CommonModule,
        
        MatSelectModule,
        MatButtonModule,
        MatPaginatorModule,
        MatCardModule, 
        MatSidenavModule,
        MatInputModule,
        MatIconModule,
        FormsModule,

        CarsRoutingModule
    ]
})
export class CarsModule { }