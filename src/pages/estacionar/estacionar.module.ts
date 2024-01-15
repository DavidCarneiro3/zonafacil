import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstacionarPage } from './estacionar';
import { ComponentsModule } from "../../components/components.module";
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';

@NgModule({
  declarations: [
    EstacionarPage,
  ],
  imports: [
    IonicPageModule.forChild(EstacionarPage),
    LoadingSpinnerComponentModule,
    ComponentsModule
  ],
})
export class EstacionarPageModule { }
