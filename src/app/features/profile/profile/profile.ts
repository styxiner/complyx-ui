import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/services/user';
import { UserDTO } from '../../../core/models/user.model';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, StatusBadge],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(User);

  user = signal<UserDTO | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar la información del perfil');
        this.loading.set(false);
        console.error('Error en perfil:', err);
      }
    });
  }
}