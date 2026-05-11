import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesCard } from './policies-card';

describe('PoliciesCard', () => {
  let component: PoliciesCard;
  let fixture: ComponentFixture<PoliciesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliciesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PoliciesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
