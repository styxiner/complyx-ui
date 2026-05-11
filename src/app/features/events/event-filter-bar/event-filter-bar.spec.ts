import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFilterBar } from './event-filter-bar';

describe('EventFilterBar', () => {
  let component: EventFilterBar;
  let fixture: ComponentFixture<EventFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent(EventFilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
