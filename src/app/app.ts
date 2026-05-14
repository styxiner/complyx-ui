import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet],
//   template: `<router-outlet />`,
// })
// export class App implements OnInit {
//   private auth = inject(AuthService);

//   ngOnInit(): void {
//     if (this.auth.isLoggedIn()) {
//       this.auth.fetchCurrentUser().subscribe({
//         error: () => {
//           // Token expirado — logout ya limpia y redirige
//         }
//       });
//     }
//   }
// }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}