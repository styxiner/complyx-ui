import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Uso: <button *appHasRole="'ADMIN'">Eliminar</button>
 *      <button *appHasRole="['ADMIN', 'TECNICO']">Ver</button>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRole implements OnInit {
  @Input('appHasRole') roles: string | string[] = [];

  private auth = inject(AuthService);
  private tpl  = inject(TemplateRef<any>);
  private vcr  = inject(ViewContainerRef);

  ngOnInit() {
    const required = Array.isArray(this.roles) ? this.roles : [this.roles];
    if (this.auth.hasRole(...required)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}