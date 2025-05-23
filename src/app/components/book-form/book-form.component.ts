import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css'
})
export class BookFormComponent implements OnInit, OnChanges {
  @Input() book: Book | null = null;
  @Output() bookSaved = new EventEmitter<Book>();
  @Output() cancelled = new EventEmitter<void>();

  bookForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService
  ) {
    this.bookForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.book) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.book) {
      this.populateForm();
    } else {
      this.bookForm.reset();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      author: ['', [Validators.required, Validators.minLength(1)]],
      isbn: ['', [Validators.required, Validators.minLength(1)]],
      publicationDate: ['', [Validators.required]]
    });
  }

  private populateForm(): void {
    if (this.book) {
      this.bookForm.patchValue({
        title: this.book.title,
        author: this.book.author,
        isbn: this.book.isbn,
        publicationDate: this.book.publicationDate
      });
    }
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.submitting = true;
      const formValue = this.bookForm.value;

      if (this.book) {
        const updatedBook: Book = {
          ...this.book,
          ...formValue
        };

        this.bookService.updateBook(this.book.id, updatedBook).subscribe({
          next: (book) => {
            this.bookSaved.emit(book);
            this.submitting = false;
          },
          error: (error) => {
            console.error('Error updating book:', error);
            this.submitting = false;
          }
        });
      } else {
        this.bookService.createBook(formValue).subscribe({
          next: (book) => {
            this.bookSaved.emit(book);
            this.submitting = false;
          },
          error: (error) => {
            console.error('Error creating book:', error);
            this.submitting = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}