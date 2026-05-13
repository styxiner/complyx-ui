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
  private router = inject(Router);

  // Estados del formulario con Signals
  public email = signal('');
  public password = signal('');
  public errorMessage = signal('');
  public isLoading = signal(false);

  onSubmit() {
    const emailValue = this.email();
    const passValue = this.password();

    if (!emailValue || !passValue) {
      this.errorMessage.set('Por favor, rellena todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // --- MODO SIMULACIÓN (Para probar sin Backend) ---
    console.log('Modo simulación activo');
    
    setTimeout(() => {
      // 1. Simulamos guardar los tokens que normalmente enviaría el servidor
      localStorage.setItem('complyx_access_token', 'fake-jwt-token');
      localStorage.setItem('complyx_refresh_token', 'fake-refresh-token');

      // 2. Simulamos los datos del usuario en el Signal del servicio
      this.authService.currentUser.set({
        name: 'Usuario de Prueba',
        email: emailValue,
        role: 'ADMIN'
      });

      // 3. Navegamos al dashboard
      this.router.navigate(['/dashboard']);
    }, 1500); // Simulamos un segundo y medio de espera de red


    /* 
    // --- MODO REAL (Descomentar esto cuando el Backend funcione) ---
    
    this.authService.login({ email: emailValue, password: passValue }).subscribe({
      next: () => {
        // El login fue exitoso, el guardado de tokens ocurre dentro del servicio (tap)
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales incorrectas o error de conexión.');
        console.error('Login error:', err);
      }
    });
    
    */
  }
}