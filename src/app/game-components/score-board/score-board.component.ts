import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p>
      score-board works!
    </p>
  `,
  styles: [
  ]
})
export class ScoreBoardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
