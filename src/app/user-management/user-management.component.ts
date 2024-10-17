import { AfterContentInit, Component, ContentChild, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserManagementService } from './user-management.service';
import {MatTableModule, MatTable, MatNoDataRow} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';



export interface User {
  fullName: string;
  email: string;
  phoneNumber: number;
  createdAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [MatTableModule,MatInputModule,MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable, {static: true}) table!: MatTable<any>;
  @ContentChild(MatNoDataRow) noDataRow!: MatNoDataRow;


  users: User[] = [];
  isLoading = true;
  displayedColumns: string[] = ['fullName', 'email', 'phoneNumber', 'createdAt', 'actions'];
  totalRecords = 0;
  limit = 10;
  page: number = 1;
  userFilterForm: FormGroup;
  private subscriptions = new Subscription();



  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private toastService: ToastService) {
    this.userFilterForm = this.fb.group({
      keyword: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  ngAfterContentInit() {
    this.table.setNoDataRow(this.noDataRow);
  }

  fetchUsers(): void {
    this.isLoading = true;
    const filterParams = {
      ...this.userFilterForm.value,
      page: this.page,
      limit: this.limit,
    };
    const usersSub = this.userManagementService.getUsers(filterParams).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalRecords = response.totalUsers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
        this.toastService.showError(error.message);
        this.isLoading = false;
      }
    });
    this.subscriptions.add(usersSub);

  }

  toggleUserStatus(user: any): void {
    const updatedStatus = !user.isActive;
    const statusSub = this.userManagementService.updateUserStatus(user._id, updatedStatus).subscribe({
      next: () => {
        user.isActive = updatedStatus;
      },
      error: (error) => {
        this.toastService.showError(error.message);
      }
    });
    this.subscriptions.add(statusSub);
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.fetchUsers();
  }

  onFilter() {
    this.page = 1;
    this.fetchUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
