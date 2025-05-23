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

  // Modal-related state
  showConfirmDialog = false;
bookIdToDelete: number | null = null;
bookTitleToDelete: string = '';

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

  // Open confirmation modal
 confirmDelete(id: number): void {
  const book = this.books.find(b => b.id === id);
  if (book) {
    this.bookIdToDelete = id;
    this.bookTitleToDelete = book.title;
    this.showConfirmDialog = true;
  }
}

  handleConfirmation(confirmed: boolean): void {
    this.showConfirmDialog = false;
    if (confirmed && this.bookIdToDelete !== null) {
      this.bookService.deleteBook(this.bookIdToDelete).subscribe({
        next: () => {
          this.books = this.books.filter(book => book.id !== this.bookIdToDelete);
          this.bookIdToDelete = null;
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
