import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDTO } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnInit {
  @Input() user: UserDTO | null = null;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<any>();

  form = {
    username: '',
    email: '',
    password: ''
  };

  ngOnInit(): void {
    if (this.user) {
      this.form.username = this.user.username;
      this.form.email = this.user.email;
    }
  }

  submit(): void {
    this.onSubmit.emit(this.form);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}