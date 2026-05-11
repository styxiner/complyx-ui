import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickReports } from './quick-reports';

describe('QuickReports', () => {
  let component: QuickReports;
  let fixture: ComponentFixture<QuickReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickReports],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
