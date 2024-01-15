import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileEditPage } from './profile-edit';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    ProfileEditPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(ProfileEditPage),
  ],
})
export class ProfileEditPageModule { }
