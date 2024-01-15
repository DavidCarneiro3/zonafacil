import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FiltroPagamentoPage } from './filtro-pagamento';

@NgModule({
  declarations: [
    FiltroPagamentoPage,
  ],
  imports: [
    IonicPageModule.forChild(FiltroPagamentoPage),
  ],
})
export class FiltroPagamentoPageModule { }
