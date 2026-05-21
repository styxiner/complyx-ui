import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router      = inject(Router);

  username     = signal('');
  password     = signal('');
  errorMessage = signal('');
  isLoading    = signal(false);

  onSubmit() {
    const username = this.username();
    const password = this.password();

    if (!username || !password) {
      this.errorMessage.set('Por favor, rellena todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ username, password }).subscribe({
      next: () => {
        // Login OK — cargar roles desde /api/users/me y navegar
        this.authService.fetchCurrentUser().subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.router.navigate(['/dashboard']), // si /me falla, ir igual
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Usuario o contraseña incorrectos.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se puede conectar con el servidor.');
        } else {
          this.errorMessage.set('Error inesperado. Inténtalo de nuevo.');
        }
      },
    });
  }
}