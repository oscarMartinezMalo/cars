import { NgModule } from '@angular/core';
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

import { AppComponent } from './app.component';
import { CarFilterPipe } from './car-filter.pipe';
import { CarsComponent } from './cars/cars.component';

@NgModule({
  declarations: [
    AppComponent,
    CarsComponent,
    CarFilterPipe
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
    HttpModule
  ],
  providers: [WebService],
  bootstrap: [AppComponent]
})
export class AppModule { }
