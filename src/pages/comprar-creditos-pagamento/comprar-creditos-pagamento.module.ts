import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';
import { ComprarCreditosPagamentoPage } from './comprar-creditos-pagamento';

@NgModule({
  declarations: [
    ComprarCreditosPagamentoPage,
  ],
  imports: [
    IonicPageModule.forChild(ComprarCreditosPagamentoPage),
    LoadingSpinnerComponentModule,
  ],
})
export class ComprarCreditosPagamentoPageModule { }
