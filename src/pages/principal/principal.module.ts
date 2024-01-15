import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';
import { PrincipalPage } from './principal';

@NgModule({
  declarations: [
    PrincipalPage,
  ],
  imports: [
    IonicPageModule.forChild(PrincipalPage),
    LoadingSpinnerComponentModule,
    ComponentsModule
  ],
})
export class PrincipalPageModule {}
