import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { BookListComponent } from './components/book-list/book-list.component';

export const appRoutes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'book-list', component: BookListComponent },
];
