import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDetailModal } from './policy-detail-modal';

describe('PolicyDetailModal', () => {
  let component: PolicyDetailModal;
  let fixture: ComponentFixture<PolicyDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
