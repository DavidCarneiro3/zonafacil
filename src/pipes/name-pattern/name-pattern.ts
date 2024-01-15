import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the NamePatternPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'namePattern',
})
export class NamePatternPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    var arr = value.split(' ');
    var keep = arr[1][0].toUpperCase() != arr[1][0];
    return arr.slice(0, keep ? 3 : 2).join(' ');
  }
  
}
