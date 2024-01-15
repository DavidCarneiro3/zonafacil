import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RootPage } from './root';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    RootPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(RootPage),
  ],
})
export class RootPageModule { }
