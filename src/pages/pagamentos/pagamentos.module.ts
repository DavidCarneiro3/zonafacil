import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagamentosPage } from './pagamentos';
import { ComponentsModule } from "../../components/components.module";
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';

@NgModule({
  declarations: [
    PagamentosPage,
  ],
  imports: [
    IonicPageModule.forChild(PagamentosPage),
    LoadingSpinnerComponentModule,
    ComponentsModule
  ],
})
export class PagamentosPageModule { }
