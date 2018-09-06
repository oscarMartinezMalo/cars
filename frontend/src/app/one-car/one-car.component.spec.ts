import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneCarComponent } from './one-car.component';

describe('OneCarComponent', () => {
  let component: OneCarComponent;
  let fixture: ComponentFixture<OneCarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneCarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
