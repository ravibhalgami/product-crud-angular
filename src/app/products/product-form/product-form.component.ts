import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


export interface Product {
  id:string;
  name: string;
  description: string;
  image: string;
  imageUrl:string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [    CommonModule, HttpClientModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @Input() product: Product | null = null; // For edit mode, product details are passed in
  @Output() submitForm = new EventEmitter<Product>();
  productForm!: FormGroup;
  productId: string = '';
  selectedFile: File | null = null;
  isLoading : boolean = false;
  isEditMode = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService : ProductService,
    private toastService : ToastService,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.product;
    this.initForm();
    this.setConditionalValidators();   
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: [this.data.product?.name || '', [Validators.required]],
      description: [this.data.product?.description || '', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      image: [''],
      fileName:[''],
      imageUrl: [this.data.product?.imageUrl || '']
    });
  }

  setConditionalValidators(): void {
    const imageControl = this.productForm.get('fileName');
    const imageUrlControl = this.productForm.get('imageUrl');

    if (!this.isEditMode) {
      // Create mode: Image is required
      imageControl?.setValidators([Validators.required]);
    } else {
      // Edit mode: If imageUrl is empty, image is required
      imageUrlControl?.valueChanges.subscribe((imageUrl: string) => {
        if (!imageUrl) {
          imageControl?.setValidators([Validators.required]);
        } else {
          imageControl?.clearValidators(); // Image not required if imageUrl exists
        }
        imageControl?.updateValueAndValidity(); // Update validation status
      });
    }
  }

  loadProductData(productId: string):void {
    const productSubscription = this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl
        });
      },
      error: (error) => {
        this.toastService.showError('Failed to load product data.');
        console.error('Failed to fetch product:', error);
      }
    });
    this.subscriptions.add(productSubscription);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData: Product = {
        ...this.productForm.value,
        id: this.data.product?._id // Preserve the ID if in edit mode
      };
      const formData = this.prepareFormData(productData); 
      this.data.onSubmit(formData);
      this.dialogRef.close(productData);
    }
  }

  prepareFormData(productData: Product): FormData {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    if (productData.id) {
      formData.append('id', productData.id);
    }
    return formData;
  }

  onFileSelect(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.productForm.patchValue({fileName : this.selectedFile.name})
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
