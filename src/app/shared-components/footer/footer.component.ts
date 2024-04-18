import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
  <footer>
    <div><i>21 Black Jack by jdecker, &copy; {{currentYear}} all rights reserved</i> </div>
  </footer>
  `,
  styles: [`
   footer {
    margin-top: 40px;
    display: block;
   }
  `]
})
export class FooterComponent implements OnInit {
  /// properties ///
  currentDate: Date = new Date();
  currentYear!: number;

  constructor() { }

  ngOnInit(): void {
    this.currentYear = this.currentDate.getFullYear();
  }

}
