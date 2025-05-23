import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, BookFormComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  showAddForm = false;
  selectedBook: Book | null = null;
  loading = false;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.loading = false;
      }
    });
  }

  editBook(book: Book): void {
    this.selectedBook = book;
    this.showAddForm = true;
  }

  deleteBook(id: number): void {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.books = this.books.filter(book => book.id !== id);
        },
        error: (error) => {
          console.error('Error deleting book:', error);
        }
      });
    }
  }

  onBookSaved(book: Book): void {
    if (this.selectedBook) {
      const index = this.books.findIndex(b => b.id === book.id);
      if (index !== -1) {
        this.books[index] = book;
      }
    } else {
      this.books.push(book);
    }
    this.onFormCancelled();
  }

  onFormCancelled(): void {
    this.showAddForm = false;
    this.selectedBook = null;
  }

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  getUniqueAuthors(): number {
    const uniqueAuthors = new Set(this.books.map(book => book.author.toLowerCase()));
    return uniqueAuthors.size;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}