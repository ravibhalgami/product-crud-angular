import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ErrorHandlerService } from '../services/error-handler.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
}

export interface ProductResponse {
  products: Product[];
  totalProducts: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}products`;

  constructor(private http: HttpClient, private errorHandlerService : ErrorHandlerService) {}

  getProducts(filters: Record<string, any>): Observable<ProductResponse> {
    const params = new HttpParams({ fromObject: filters });
    return this.http.get<ProductResponse>(`${this.apiUrl}`, { params }).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }

  createProduct(product: any): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }

  updateProduct(id: string, product: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandlerService.handleError)
    );
  }
}
