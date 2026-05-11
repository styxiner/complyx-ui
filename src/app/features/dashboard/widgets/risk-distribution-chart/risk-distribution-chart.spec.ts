import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskDistributionChart } from './risk-distribution-chart';

describe('RiskDistributionChart', () => {
  let component: RiskDistributionChart;
  let fixture: ComponentFixture<RiskDistributionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDistributionChart],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskDistributionChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
