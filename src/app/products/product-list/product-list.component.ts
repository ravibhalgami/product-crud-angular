import { Component, Output } from '@angular/core';
import { ProductService } from '../product.service';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Product, ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatTableModule,MatInputModule,MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  products: any[] = [];
  isLoading: boolean = true;
  totalRecords: number = 0;
  limit: number = 10;
  page: number = 1;
  displayedColumns: string[] = ['name', 'description', 'imageUrl', 'createdAt', 'actions'];
  isAdmin : boolean = false;
  productFilterForm: FormGroup;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private fb: FormBuilder,private productService: ProductService, private authService: AuthService, private dialog: MatDialog, private toastService: ToastService) {
    this.productFilterForm = this.fb.group({
      keyword: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'admin' ? true : false;
    if (this.isAdmin) {
      let index = this.displayedColumns.indexOf('imageUrl');
      if (index !== -1) {
        this.displayedColumns.splice(index + 1, 0, 'createdBy');
      }
      this.displayedColumns = this.displayedColumns.filter(item => item !== 'actions');

    }
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.isLoading = true;

    const filterParams = {
      ...this.productFilterForm.value,
      page: this.page,
      limit: this.limit,
    };

    this.productService.getProducts(filterParams).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalRecords = response.totalProducts;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.showError(`Failed to fetch products: ${error.message}`);
        this.isLoading = false;
      }
    });
  }

  deleteProduct(productId: string): void {
    this.isLoading = true;
    this.productService.deleteProduct(productId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this.fetchProducts(); // Reload products after successful deletion
      },
      error: (error) => {
        this.toastService.showError(`Failed to delete product: ${error.message}`);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.fetchProducts();
  }

  onFilter() {
    this.page = 1;
    this.fetchProducts();
  }

  openConfirmDialog(productId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      if (result) {
        this.deleteProduct(productId);
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup to prevent memory leaks
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  openCreateProductDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: {
        onSubmit: this.onProductSubmit.bind(this)
      } 
    });
  }

  openEditProductDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: {
        product: product,
        onSubmit: this.onProductSubmit.bind(this)
      }
    });
  }

  onProductSubmit(formData: FormData) {
    const productData: any = {};

    // Use FormData.entries() to get all entries in the FormData
    formData.forEach((value, key) => {
      productData[key] = value;
    });
    if (productData.id) {
      // Call the update service method
      this.productService.updateProduct(productData.id, formData).subscribe({
          next:() => {
            this.toastService.showSuccess("Product updated successfully");
            this.fetchProducts(); 
          },
          error:(error : Error) => {
            this.toastService.showError(error.message);
          }
        }
      );
    } else {
      // Call the create service method
      this.productService.createProduct(formData).subscribe({
        next:() => {
          this.toastService.showSuccess("Product created successfully");
          this.fetchProducts(); 
        },
        error:(error : Error) => {
          this.toastService.showError(error.message);
        }
      });
    }
  }
}
