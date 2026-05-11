import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceCard } from './compliance-card';

describe('ComplianceCard', () => {
  let component: ComplianceCard;
  let fixture: ComponentFixture<ComplianceCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplianceCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
