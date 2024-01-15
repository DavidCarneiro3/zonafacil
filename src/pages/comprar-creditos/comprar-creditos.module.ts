import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComprarCreditosPage } from './comprar-creditos';
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';

@NgModule({
  declarations: [
    ComprarCreditosPage,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(ComprarCreditosPage),
    LoadingSpinnerComponentModule,
  ],
})
export class ComprarCreditosPageModule { }
