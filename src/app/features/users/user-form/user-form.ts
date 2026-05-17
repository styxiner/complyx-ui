import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDTO } from '../../../core/models/user.model';

interface RoleBackendDTO {
  id: string;
  roleName: string; 
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnChanges {
  @Input() user: UserDTO | null = null;
  @Input() availableRoles: RoleBackendDTO[] = [];
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<{ form: any, selectedRoleIds: string[] }>();

  form = {
    username: '',
    email: '',
    password: ''
  };

  selectedRoleIds: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.user) {
      // Modo Edición
      this.form.username = this.user.username;
      this.form.email = this.user.email;
      this.form.password = ''; 
      
      // Sincronizamos comparando el array de strings (this.user.roles) 
      // con el campo role.roleName de los roles disponibles. Si coincide, guardamos su ID.
      if (this.availableRoles && this.availableRoles.length > 0) {
        this.selectedRoleIds = this.availableRoles
          .filter(r => this.user?.roles?.includes(r.roleName))
          .map(r => r.id);
      }
    } else {
      // Modo Creación
      this.form = { username: '', email: '', password: '' };
      this.selectedRoleIds = [];
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  toggleRole(roleId: string): void {
    if (this.selectedRoleIds.includes(roleId)) {
      this.selectedRoleIds = this.selectedRoleIds.filter(id => id !== roleId);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  submit(): void {
    this.onSubmit.emit({
      form: this.form,
      selectedRoleIds: this.selectedRoleIds
    });
  }

  cancel(): void {
    this.onCancel.emit();
  }
}