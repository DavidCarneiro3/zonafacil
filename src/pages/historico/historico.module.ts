import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistoricoPage } from './historico';
import { LoadingSpinnerComponentModule } from './../../components/loading-spinner/loading-spinner.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    HistoricoPage,
  ],
  imports: [
    PipesModule,
    LoadingSpinnerComponentModule,
    IonicPageModule.forChild(HistoricoPage),
    ComponentsModule
  ],
})
export class HistoricoPageModule { }
