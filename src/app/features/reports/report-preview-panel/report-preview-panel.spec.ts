import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPreviewPanel } from './report-preview-panel';

describe('ReportPreviewPanel', () => {
  let component: ReportPreviewPanel;
  let fixture: ComponentFixture<ReportPreviewPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPreviewPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportPreviewPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
