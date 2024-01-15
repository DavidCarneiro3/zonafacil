import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VeiculosPage } from './veiculos';
import { ComponentsModule } from "../../components/components.module";
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';

@NgModule({
  declarations: [
    VeiculosPage,
  ],
  imports: [
    IonicPageModule.forChild(VeiculosPage),
    LoadingSpinnerComponentModule,
    ComponentsModule
  ],
})
export class VeiculosPageModule { }
