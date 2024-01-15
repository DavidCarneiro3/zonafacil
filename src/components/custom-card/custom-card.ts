import { Component, Input } from '@angular/core';

/**
 * Generated class for the CustomCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'custom-card',
  templateUrl: 'custom-card.html'
})
export class CustomCardComponent {

  text: string;
  @Input('color') color;
  constructor() {
    console.log('Hello CustomCardComponent Component');
    this.text = 'Hello World';
  }

}
