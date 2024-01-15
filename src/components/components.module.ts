import { NgModule } from '@angular/core';
import { IonicModule } from "ionic-angular";

import { UserInfoComponent } from './user-info/user-info';
import { TimerComponent } from "./timer/timer";
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { CustomCardComponent } from './custom-card/custom-card';

@NgModule({
    declarations: [UserInfoComponent, TimerComponent,
    ProgressBarComponent,
    CustomCardComponent],
    imports: [IonicModule],
    exports: [UserInfoComponent, TimerComponent,
    ProgressBarComponent,
    CustomCardComponent]
})
export class ComponentsModule {
}
