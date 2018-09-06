import { NgModule } from '@angular/core';
import {RouterModule} from "@angular/router";
import { BrowserModule } from '@angular/platform-browser';
import {NgxPaginationModule} from 'ngx-pagination';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { WebService } from './web.service';
import { HttpModule } from '@angular/http';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { CarFilterPipe } from './car-filter.pipe';
import { CarsComponent } from './cars/cars.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent} from './home.component';
import { OneCarComponent } from './one-car/one-car.component';

var routes =[{
  path: '',
  component: HomeComponent,
},
{
  path: 'cars',
  component: CarsComponent,
},
{
  path: 'cars/:id',
  // component: CarsComponent,
  component: OneCarComponent
}];

@NgModule({
  declarations: [
    AppComponent,
    CarsComponent,
    CarFilterPipe,
    NavComponent,
    HomeComponent,
    OneCarComponent    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,
    NgxPaginationModule,
    HttpModule,
    MatSnackBarModule,
    MatMenuModule,
    MatToolbarModule,
    RouterModule.forRoot(routes)
  ],
  providers: [WebService],
  bootstrap: [AppComponent]
})
export class AppModule { }
