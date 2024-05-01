import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    body {
    //  background-image: linear-gradient(to right top, #4c8f5d, #509362, #549766, #599c6b, #5da070, #599c6c, #549768, #509364, #428556, #347649, #25693c, #155b2f);
    }
  `]
})
export class AppComponent {
  title = 'BlkJck';
}
