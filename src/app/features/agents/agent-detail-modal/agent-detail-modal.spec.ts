import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentDetailModal } from './agent-detail-modal';
import { AgentService }     from '../../../core/services/agent';
import { of, throwError }   from 'rxjs';
import { AgentDTO }         from '../../../core/models/agent.model';

const MOCK_AGENT: AgentDTO = {
  id: 'a1',
  hostname: 'srv-test',
  ip: '10.0.0.1',
  osName: 'Ubuntu',
  osVersion: '22.04',
  agentVersion: '1.0.0',
  enabled: true,
  registeredDate: '2024-01-01T00:00:00Z',
  lastSeen: '2024-06-01T12:00:00Z',
  groups: ['prod'],
};

describe('AgentDetailModal', () => {
  let fixture: ComponentFixture<AgentDetailModal>;
  let component: AgentDetailModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentDetailModal],
      providers: [
        {
          provide: AgentService,
          useValue: {
            getById:     () => of(MOCK_AGENT),
            getPolicies: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(AgentDetailModal);
    component = fixture.componentInstance;
    component.agentId = 'a1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load agent data', () => {
    expect(component.agent()?.hostname).toBe('srv-test');
    expect(component.loading()).toBeFalse();
  });

  it('should default to info tab', () => {
    expect(component.activeTab()).toBe('info');
  });

  it('should switch tabs', () => {
    component.setTab('policies');
    expect(component.activeTab()).toBe('policies');
  });

  it('should set error on load failure', () => {
    const svc = TestBed.inject(AgentService);
    spyOn(svc, 'getById').and.returnValue(throwError(() => new Error('fail')));
    component.agentId = 'bad-id';
    component.ngOnInit();
    expect(component.error()).toBeTrue();
  });

  it('enabledStatus should map correctly', () => {
    expect(component.enabledStatus(true)).toBe('active');
    expect(component.enabledStatus(false)).toBe('inactive');
  });

  it('severityStatus should map CRITICAL correctly', () => {
    expect(component.severityStatus('CRITICAL')).toBe('critical');
    expect(component.severityStatus('unknown-val')).toBe('unknown');
  });
});