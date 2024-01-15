import { LoadingSpinnerComponent } from './loading-spinner';
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular/module';

@NgModule({
	declarations: [LoadingSpinnerComponent],
	imports: [IonicModule],
	exports: [LoadingSpinnerComponent],
	entryComponents: [LoadingSpinnerComponent]
})
export class LoadingSpinnerComponentModule { }
