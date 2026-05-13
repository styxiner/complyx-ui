import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f0f2f5;
    }
  `]
})
export class AuthLayout {}