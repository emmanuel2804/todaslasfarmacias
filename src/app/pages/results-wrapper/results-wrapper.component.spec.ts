import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsWrapperComponent } from './results-wrapper.component';

describe('ResultsWrapperComponent', () => {
  let component: ResultsWrapperComponent;
  let fixture: ComponentFixture<ResultsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
