import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService : AuthService, private router : Router, private toastService : ToastService) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return; // Do not proceed if the form is invalid
    }
    this.isLoading = true;
    this.errorMessage = null;
    const signupData = this.signupForm.value;
    this.authService.signup(signupData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
        this.toastService.showSuccess('Signup successful! Please login.');
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.toastService.showError(error.message);
      }
    });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value) ? null : { weakPassword: true };
  }

  passwordMatchValidator(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  get fullName(): AbstractControl {
    return this.signupForm.get('fullName')!;
  }

  get email(): AbstractControl {
    return this.signupForm.get('email')!;
  }

  get phoneNumber(): AbstractControl {
    return this.signupForm.get('phoneNumber')!;
  }

  get password(): AbstractControl {
    return this.signupForm.get('password')!;
  }

  get confirmPassword(): AbstractControl {
    return this.signupForm.get('confirmPassword')!;
  }
}
