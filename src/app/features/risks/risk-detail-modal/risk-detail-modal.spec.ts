import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskDetailModal } from './risk-detail-modal';

describe('RiskDetailModal', () => {
  let component: RiskDetailModal;
  let fixture: ComponentFixture<RiskDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
