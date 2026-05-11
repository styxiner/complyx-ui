import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportButtons } from './export-buttons';

describe('ExportButtons', () => {
  let component: ExportButtons;
  let fixture: ComponentFixture<ExportButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportButtons],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportButtons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
