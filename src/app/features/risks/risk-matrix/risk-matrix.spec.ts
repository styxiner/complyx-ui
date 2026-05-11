import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskMatrix } from './risk-matrix';

describe('RiskMatrix', () => {
  let component: RiskMatrix;
  let fixture: ComponentFixture<RiskMatrix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskMatrix],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskMatrix);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
