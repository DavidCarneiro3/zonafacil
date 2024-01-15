import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PdvEmpresaPage } from './pdv-empresa';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    PdvEmpresaPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(PdvEmpresaPage),
  ],
})
export class PdvEmpresaPageModule { }
