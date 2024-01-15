import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VeiculosFormPage } from './veiculos-form';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  declarations: [
    VeiculosFormPage,
  ],
  imports: [
    IonicPageModule.forChild(VeiculosFormPage),
    TextMaskModule,
  ]
})
export class VeiculosFormPageModule { }
