import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent {
  // Inyectamos el servicio de autenticación
  private authService = inject(AuthService);

  // Usamos el signal del usuario para que la UI se actualice sola
  public user = this.authService.currentUser;

  /**
   * Cierra la sesión y redirige al login
   */
  onLogout() {
    this.authService.logout();
  }
}