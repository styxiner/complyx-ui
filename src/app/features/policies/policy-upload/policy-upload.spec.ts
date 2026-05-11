import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyUpload } from './policy-upload';

describe('PolicyUpload', () => {
  let component: PolicyUpload;
  let fixture: ComponentFixture<PolicyUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
