import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceChart } from './compliance-chart';

describe('ComplianceChart', () => {
  let component: ComplianceChart;
  let fixture: ComponentFixture<ComplianceChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceChart],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplianceChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
