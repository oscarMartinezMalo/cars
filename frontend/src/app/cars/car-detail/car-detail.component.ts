import { Component, OnInit, Input } from '@angular/core';
import { Car } from '../car.model';
// import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css']
})
export class CarDetailComponent implements OnInit {
@Input() car: Car;

  // constructor( private bottomSheet: MatBottomSheet){}

  ngOnInit() {
  }

  // openBottomSheet(): void {
  //   this.bottomSheet.open(BottomSheetOverviewExampleSheet);
  // }

}

// @Component({
//   selector: 'bottom-sheet-overview-example-sheet',
//   // templateUrl: '../one-car/one-car.component.html',
//   templateUrl: 'bottom-sheet-overview-example-sheet.html',
// })
// export class BottomSheetOverviewExampleSheet {
//   constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheet>) {}

//   openLink(event: MouseEvent): void {
//     this.bottomSheetRef.dismiss();
//     event.preventDefault();
//   }
// }
