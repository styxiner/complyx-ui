import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsCard } from './agents-card';

describe('AgentsCard', () => {
  let component: AgentsCard;
  let fixture: ComponentFixture<AgentsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentsCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
