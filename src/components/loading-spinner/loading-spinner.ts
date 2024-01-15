import { Component } from '@angular/core';

@Component({
  selector: 'loading-spinner',
  templateUrl: 'loading-spinner.html'
})
export class LoadingSpinnerComponent {

  text: string;

  constructor() {
    this.text = 'Hello World';
  }

}
