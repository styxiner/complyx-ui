import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisksCard } from './risks-card';

describe('RisksCard', () => {
  let component: RisksCard;
  let fixture: ComponentFixture<RisksCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisksCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RisksCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
