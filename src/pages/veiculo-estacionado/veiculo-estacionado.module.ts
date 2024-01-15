import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VeiculoEstacionadoPage } from './veiculo-estacionado';

@NgModule({
  declarations: [
    VeiculoEstacionadoPage,
  ],
  imports: [
    IonicPageModule.forChild(VeiculoEstacionadoPage),
  ],
})
export class VeiculoEstacionadoPageModule { }
