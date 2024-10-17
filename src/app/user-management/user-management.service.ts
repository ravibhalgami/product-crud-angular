import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ErrorHandlerService } from '../services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}users`; // Update with your API URL

  constructor(private http: HttpClient, private errorHandlerService : ErrorHandlerService) {}

  // Fetch all users
  getUsers(filters:{}): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { params: filters }).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }

  // Update user status (active/inactive)
  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/status`, { isActive }).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }
}
