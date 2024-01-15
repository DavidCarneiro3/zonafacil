import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    SignupPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(SignupPage),
  ],
})
export class SignupPageModule { }
