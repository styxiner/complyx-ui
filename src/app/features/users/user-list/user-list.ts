import { Component, OnInit, inject, signal, computed } from '@angular/core'; // 🛠️ AÑADIDO: computed
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { user as UserService } from '../../../core/services/user';
import { UserDTO } from '../../../core/models/user.model';
import { UserForm } from '../user-form/user-form';

interface RoleBackendDTO {
  id: string;
  roleName: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserForm],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {
  private userService = inject(UserService);

  actionIconPaths = {
    edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
    delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
  };

  users = signal<UserDTO[]>([]);
  availableRoles = signal<RoleBackendDTO[]>([]);
  loading = signal(true);
  
  // 🛠️ CAMBIO: Convertimos searchTerm en un signal para que el filtrado reactivo funcione al instante
  searchTerm = signal<string>('');

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  isModalOpen = signal(false);
  selectedUser = signal<UserDTO | null>(null);

  // 🛠️ NUEVO: Este computed se ejecuta automáticamente en el Front cada vez que cambia el texto de búsqueda
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.users(); // Si no hay texto, muestra todos los de la página actual
    }
    // Filtra localmente si el nombre o el email contienen los caracteres buscados
    return this.users().filter(u => 
      u.username.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading.set(true);
    // Limpiamos el envío de texto al back para traer la página base limpia y paginada sin conflictos
    this.userService.getAllUsers(this.currentPage(), 10).subscribe({
      next: (res) => {
        const normalizedUsers = res.content.map((u: any): UserDTO => ({
          id: u.id,
          username: u.username,
          email: u.email,
          roles: u.roles ? u.roles.map((r: any) => typeof r === 'string' ? r : (r.roleName || r.name)) : []
        }));
        this.users.set(normalizedUsers);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // 🛠️ MODIFICADO: Actualiza el signal de búsqueda inmediatamente al escribir
  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (res) => {
        const rolesFromBack = res.content.map((r: any) => ({
          id: r.id,
          roleName: r.roleName || r.name || 'Sin nombre'
        }));
        this.availableRoles.set(rolesFromBack);
      }
    });
  }

  changePage(step: number): void {
    const targetPage = this.currentPage() + step;
    if (targetPage >= 0 && targetPage < this.totalPages()) {
      this.currentPage.set(targetPage);
      this.loadUsers();
    }
  }

  openCreateModal(): void {
    this.selectedUser.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(user: UserDTO): void {
    this.selectedUser.set(user);
    this.isModalOpen.set(true);
  }

  handleFormSubmit(submitData: { form: any, selectedRoleIds: string[] }): void {
    const isEditing = this.selectedUser() !== null;
    const userId = this.selectedUser()?.id;

    const baseRequest$ = isEditing
      ? this.userService.updateUser(userId!, submitData.form)
      : this.userService.createUser(submitData.form);

    baseRequest$.subscribe({
      next: (res: any) => {
        const targetUserId = userId || res?.id;
        if (targetUserId) {
          this.syncUserRoles(targetUserId, submitData.selectedRoleIds).subscribe({
            next: () => this.closeAndReload()
          });
        } else {
          this.closeAndReload();
        }
      }
    });
  }

  private closeAndReload(): void {
    this.isModalOpen.set(false);
    this.loadUsers();
  }

  private syncUserRoles(userId: string, newRoleIds: string[]): Observable<any> {
    const roleRequests: Observable<void>[] = [];
    this.availableRoles().forEach(role => {
      const wasAssigned = this.selectedUser()?.roles?.includes(role.roleName) || false;
      const isNowSelected = newRoleIds.includes(role.id);
      if (isNowSelected && !wasAssigned) roleRequests.push(this.userService.assignRole(userId, role.id));
      else if (!isNowSelected && wasAssigned) roleRequests.push(this.userService.removeRole(userId, role.id));
    });
    return roleRequests.length > 0 ? forkJoin(roleRequests) : of([]);
  }

  deleteUser(userId: string): void {
    if (confirm('¿Desea revocar permanentemente los accesos de este usuario?')) {
      this.userService.deleteUser(userId).subscribe(() => this.loadUsers());
    }
  }

  hasRole(user: UserDTO, roleName: string): boolean {
    return user.roles?.includes(roleName) || false;
  }
}