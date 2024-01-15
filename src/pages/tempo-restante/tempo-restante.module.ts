import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TempoRestantePage } from './tempo-restante';
import { ComponentsModule } from "../../components/components.module";
import { LoadingSpinnerComponentModule } from '../../components/loading-spinner/loading-spinner.module';
import { RoundProgressModule } from 'angular-svg-round-progressbar';



@NgModule({
    declarations: [
        TempoRestantePage,
    ],
    imports: [
        IonicPageModule.forChild(TempoRestantePage),
        LoadingSpinnerComponentModule,
        ComponentsModule,
        RoundProgressModule
        
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class TempoRestantePageModule {
}
