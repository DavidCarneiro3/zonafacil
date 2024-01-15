import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';
import { ComprovantePage } from './comprovante';

@NgModule({
  declarations: [
    ComprovantePage,
  ],
  imports: [
    IonicPageModule.forChild(ComprovantePage),
    ComponentsModule,
    LoadingSpinnerComponentModule,
  ],
})
export class ComprovantePageModule { }
