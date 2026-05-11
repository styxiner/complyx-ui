import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulationUpload } from './regulation-upload';

describe('RegulationUpload', () => {
  let component: RegulationUpload;
  let fixture: ComponentFixture<RegulationUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulationUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(RegulationUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
