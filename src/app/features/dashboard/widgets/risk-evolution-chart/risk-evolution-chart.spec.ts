import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskEvolutionChart } from './risk-evolution-chart';

describe('RiskEvolutionChart', () => {
  let component: RiskEvolutionChart;
  let fixture: ComponentFixture<RiskEvolutionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskEvolutionChart],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskEvolutionChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
