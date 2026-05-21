import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRole {
  @Input('appHasRole') roles: string | string[] = [];

  private auth = inject(AuthService);
  private tpl  = inject(TemplateRef<any>);
  private vcr  = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      // Se re-ejecuta automáticamente cuando currentUser cambia
      const required = Array.isArray(this.roles) ? this.roles : [this.roles];
      const hasAccess = this.auth.hasRole(...required);

      this.vcr.clear();
      if (hasAccess) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}