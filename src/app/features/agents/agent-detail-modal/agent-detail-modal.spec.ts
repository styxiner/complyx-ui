import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentDetailModal } from './agent-detail-modal';

describe('AgentDetailModal', () => {
  let component: AgentDetailModal;
  let fixture: ComponentFixture<AgentDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
