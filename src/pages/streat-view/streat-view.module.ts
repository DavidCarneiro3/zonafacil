import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StreatViewPage } from './streat-view';

@NgModule({
    declarations: [
        StreatViewPage,
    ],
    imports: [
        IonicPageModule.forChild(StreatViewPage)
    ],
})
export class StreatViewPageModule {
}
