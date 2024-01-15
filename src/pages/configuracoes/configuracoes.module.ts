import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfiguracoesPage } from './configuracoes';
import { AccordionModule } from "../../components/accordion/accordion.module";
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';

@NgModule({
  declarations: [
    ConfiguracoesPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfiguracoesPage),
    AccordionModule,
    LoadingSpinnerComponentModule,
  ],
})
export class ConfiguracoesPageModule { }
