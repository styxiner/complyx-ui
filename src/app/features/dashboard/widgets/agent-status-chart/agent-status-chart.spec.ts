import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentStatusChart } from './agent-status-chart';

describe('AgentStatusChart', () => {
  let component: AgentStatusChart;
  let fixture: ComponentFixture<AgentStatusChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentStatusChart],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentStatusChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
