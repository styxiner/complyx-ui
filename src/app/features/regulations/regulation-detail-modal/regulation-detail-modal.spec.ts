import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulationDetailModal } from './regulation-detail-modal';

describe('RegulationDetailModal', () => {
  let component: RegulationDetailModal;
  let fixture: ComponentFixture<RegulationDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulationDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(RegulationDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
