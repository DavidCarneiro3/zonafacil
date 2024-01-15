import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagamentosFormPage } from './pagamentos-form';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    PagamentosFormPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(PagamentosFormPage),
  ],
})
export class PagamentosFormPageModule { }
