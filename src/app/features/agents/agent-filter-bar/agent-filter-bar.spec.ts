import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentFilterBar } from './agent-filter-bar';

describe('AgentFilterBar', () => {
  let component: AgentFilterBar;
  let fixture: ComponentFixture<AgentFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentFilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentFilterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
