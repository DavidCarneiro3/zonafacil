import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmarCpfModalPage } from './confirmar-cpf-modal';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    ConfirmarCpfModalPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(ConfirmarCpfModalPage),
  ],
})
export class ConfirmarCpfModalPageModule { }
