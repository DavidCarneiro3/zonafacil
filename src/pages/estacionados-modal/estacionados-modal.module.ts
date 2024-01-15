import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstacionadosModalPage } from './estacionados-modal';

@NgModule({
  declarations: [
    EstacionadosModalPage,
  ],
  imports: [
    IonicPageModule.forChild(EstacionadosModalPage),
  ],
})
export class EstacionadosModalPageModule {}
