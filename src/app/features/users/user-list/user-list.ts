import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { user as UserService } from '../../../core/services/user';
import { UserDTO } from '../../../core/models/user.model';
import { UserForm } from '../user-form/user-form';

interface RoleBackendDTO {
  id: string;
  rolename: string;
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

  users = signal<UserDTO[]>([]);
  availableRoles = signal<RoleBackendDTO[]>([]);
  loading = signal(true);

  // Propiedad normal para que ngModel funcione correctamente
  searchTerm = '';

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  isModalOpen = signal(false);
  selectedUser = signal<UserDTO | null>(null);

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers(this.currentPage(), 10, this.searchTerm).subscribe({
      next: (res) => {
        const normalizedUsers = res.content.map((u: any): UserDTO => ({
          id: u.id,
          username: u.username,
          email: u.email,
          roles: u.roles ? u.roles.map((r: any) => r.rolename || r.name) : []
        }));

        this.users.set(normalizedUsers);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (res) => {
        const rolesFromBack = res.content.map((r: any) => ({
          id: r.id,
          rolename: r.rolename || r.name || 'Sin nombre'
        }));
        this.availableRoles.set(rolesFromBack);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadUsers();
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

  handleFormSubmit(formData: any): void {
    const request$ = this.selectedUser()
      ? this.userService.updateUser(this.selectedUser()!.id, formData)
      : this.userService.createUser(formData);

    request$.subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.loadUsers();
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('¿Desea revocar permanentemente los accesos de este usuario?')) {
      this.userService.deleteUser(userId).subscribe(() => this.loadUsers());
    }
  }

  toggleRole(user: UserDTO, role: RoleBackendDTO, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const roleName = role.rolename;
    const roleUuid = role.id;

    if (!roleUuid) {
      console.error(`No se encontró un UUID válido para el rol: ${roleName}`);
      return;
    }

    if (checked) {
      user.roles = [...user.roles, roleName];
    } else {
      user.roles = user.roles.filter(r => r !== roleName);
    }

    const action$ = checked
      ? this.userService.assignRole(user.id, roleUuid)
      : this.userService.removeRole(user.id, roleUuid);

    action$.subscribe({
      error: () => this.loadUsers()
    });
  }

  hasRole(user: UserDTO, roleName: string): boolean {
    return user.roles?.includes(roleName) || false;
  }
}