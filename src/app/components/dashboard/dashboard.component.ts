import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Book } from '../../models/book';
import { BookService } from '../../services/book.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  latestBooks: Book[] = [];
  oldestBooks: Book[] = [];
  chartData: { author: string; count: number }[] = [];
  
  // Color palette for the chart
  private authorColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1'  // Indigo
  ];

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((books: Book[]) => {
      // Sort by Id descending for latest books (highest IDs)
      const sortedByIdDesc = [...books].sort((a, b) => b.id - a.id);
      this.latestBooks = sortedByIdDesc.slice(0, 5);

      // Sort by Id ascending for oldest books (lowest IDs)
      const sortedByIdAsc = [...books].sort((a, b) => a.id - b.id);
      this.oldestBooks = sortedByIdAsc.slice(0, 10);

      // Group books by author
      const authorMap = new Map<string, number>();
      books.forEach(book => {
        const current = authorMap.get(book.author) || 0;
        authorMap.set(book.author, current + 1);
      });

      // Sort authors by book count (descending)
      this.chartData = Array.from(authorMap.entries())
        .map(([author, count]) => ({ author, count }))
        .sort((a, b) => b.count - a.count);

      // Create chart after data is loaded
      setTimeout(() => this.createDonutChart(), 0);
    });
  }

  createDonutChart(): void {
    const canvas = document.getElementById('authorChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Take top 5 authors and group the rest as "Others"
    const topAuthors = this.chartData.slice(0, 5);
    const othersCount = this.chartData.slice(5).reduce((sum, item) => sum + item.count, 0);
    
    const chartLabels = topAuthors.map(data => data.author);
    const chartDataValues = topAuthors.map(data => data.count);
    const chartColors = topAuthors.map((_, index) => this.authorColors[index]);
    
    if (othersCount > 0) {
      chartLabels.push('Others');
      chartDataValues.push(othersCount);
      chartColors.push('#84CC16');
    }

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartDataValues,
          backgroundColor: chartColors,
          borderWidth: 0,
          
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We'll show custom legend below
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F3F4F6',
            bodyColor: '#F3F4F6',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} books (${percentage}%)`;
              }
            }
          }
        },
        elements: {
          arc: {
            borderWidth: 0
          }
        }
      }
    });
  }

  // Helper method to get total books count
  getTotalBooks(): number {
    return this.chartData.reduce((sum, item) => sum + item.count, 0);
  }

  // Helper method to get author color by index
  getAuthorColor(index: number): string {
    return this.authorColors[index] || '#84CC16';
  }

  // Helper method to get count of "Others" category
  getOthersCount(): number {
    return this.chartData.slice(5).reduce((sum, item) => sum + item.count, 0);
  }
}