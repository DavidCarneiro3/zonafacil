import { NgModule } from '@angular/core';
import { IonicModule } from "ionic-angular";
import { AccordionComponent } from "./accordion";

@NgModule({
    declarations: [AccordionComponent],
    imports: [IonicModule],
    exports: [AccordionComponent]
})
export class AccordionModule {
}
