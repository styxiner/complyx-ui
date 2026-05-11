import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulationList } from './regulation-list';

describe('RegulationList', () => {
  let component: RegulationList;
  let fixture: ComponentFixture<RegulationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulationList],
    }).compileComponents();

    fixture = TestBed.createComponent(RegulationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
