import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentList }    from './agent-list';
import { AgentService } from '../../../core/services/agent';
import { AgentGroupService } from '../../../core/services/agent';
import { of, throwError } from 'rxjs';
import { AgentDTO }     from '../../../core/models/agent.model';

const MOCK_AGENT: AgentDTO = {
  id: 'a1',
  hostname: 'srv-01',
  ip: '192.168.1.1',
  osName: 'Ubuntu',
  osVersion: '22.04',
  agentVersion: '1.2.0',
  enabled: true,
  registeredDate: '2024-01-01T00:00:00Z',
  lastSeen: '2024-06-01T10:00:00Z',
  groups: [],
};

const MOCK_PAGE = {
  content: [MOCK_AGENT],
  totalElements: 1,
  totalPages: 1,
  size: 20,
  number: 0,
};

describe('AgentList', () => {
  let fixture:   ComponentFixture<AgentList>;
  let component: AgentList;
  let agentSvc:  jasmine.SpyObj<AgentService>;

  beforeEach(async () => {
    agentSvc = jasmine.createSpyObj('AgentService', ['getAll', 'enable', 'disable', 'delete', 'getPolicies']);
    agentSvc.getAll.and.returnValue(of(MOCK_PAGE));
    agentSvc.getPolicies.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AgentList],
      providers: [
        { provide: AgentService, useValue: agentSvc },
        {
          provide: AgentGroupService,
          useValue: {
            getAll: () => of({ content: [], totalElements: 0, totalPages: 0, size: 100, number: 0 }),
          },
        },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(AgentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load agents on init', () => {
    expect(agentSvc.getAll).toHaveBeenCalledOnceWith({}, 0, 20);
    expect(component.agents.length).toBe(1);
    expect(component.totalElements).toBe(1);
  });

  it('should set error flag on load failure', () => {
    agentSvc.getAll.and.returnValue(throwError(() => new Error('fail')));
    component.load();
    expect(component.error()).toBeTrue();
  });

  it('openDetail should set selectedAgentId', () => {
    component.openDetail(MOCK_AGENT);
    expect(component.selectedAgentId()).toBe('a1');
  });

  it('closeDetail should clear selectedAgentId', () => {
    component.openDetail(MOCK_AGENT);
    component.closeDetail();
    expect(component.selectedAgentId()).toBeNull();
  });

  it('requestDelete should set agentToDelete', () => {
    const event = new MouseEvent('click');
    component.requestDelete(MOCK_AGENT, event);
    expect(component.agentToDelete()).toEqual(MOCK_AGENT);
  });

  it('cancelDelete should clear agentToDelete', () => {
    component.agentToDelete.set(MOCK_AGENT);
    component.cancelDelete();
    expect(component.agentToDelete()).toBeNull();
  });

  it('enabledStatus should map boolean to StatusVariant', () => {
    expect(component.enabledStatus(true)).toBe('active');
    expect(component.enabledStatus(false)).toBe('inactive');
  });

  it('onFilterChange should reset page and reload', () => {
    component.page = 2;
    component.onFilterChange({ hostname: 'srv' });
    expect(component.page).toBe(0);
    expect(component.activeFilter).toEqual({ hostname: 'srv' });
    expect(agentSvc.getAll).toHaveBeenCalledWith({ hostname: 'srv' }, 0, 20);
  });
});