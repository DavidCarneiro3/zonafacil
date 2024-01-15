import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SetoresModalPage } from "./setores-modal";

@NgModule({
  declarations: [
    SetoresModalPage,
  ],
  imports: [
    IonicPageModule.forChild(SetoresModalPage),
  ],
})
export class SetoresModalPageModule { }
