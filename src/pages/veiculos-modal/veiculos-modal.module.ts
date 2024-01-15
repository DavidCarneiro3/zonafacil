import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VeiculosModalPage } from "./veiculos-modal";

@NgModule({
  declarations: [
    VeiculosModalPage,
  ],
  imports: [
    IonicPageModule.forChild(VeiculosModalPage),
  ],
})
export class VeiculosModalPageModule { }
