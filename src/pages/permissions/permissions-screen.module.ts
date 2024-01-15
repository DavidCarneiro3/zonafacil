import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PermissionsModalPage } from "./permissions-screen";


@NgModule({
    declarations: [
        PermissionsModalPage,
    ],
    imports: [
        IonicPageModule.forChild(PermissionsModalPage),
    ],
})

export class PermissionsModalPageModule { }