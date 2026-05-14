import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutside {
  @Output() appClickOutside = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null) {
    if (!target) return;
    if (!this.el.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  }
}