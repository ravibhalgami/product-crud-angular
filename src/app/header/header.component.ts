import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getAuthToken } from '../utils/auth.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isAdmin : boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.loggedIn$.subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
      })
    );

    this.subscriptions.add(
      this.authService.userRole$.subscribe(role => {
        this.isAdmin = role === 'admin';
      })
    );

    this.checkAuthentication();
  }

  checkAuthentication() {
    const token = getAuthToken(this.document, this.platformId);
    this.isLoggedIn = !!token;
    const userRole = this.authService.getUserRole();
    this.isAdmin = this.authService.getUserRole() === 'admin';
  }

  logout() {
    this.authService.logout();
    this.checkAuthentication(); // Update the login status
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
