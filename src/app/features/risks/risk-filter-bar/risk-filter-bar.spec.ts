import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskFilterBar } from './risk-filter-bar';

describe('RiskFilterBar', () => {
  let component: RiskFilterBar;
  let fixture: ComponentFixture<RiskFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskFilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskFilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
