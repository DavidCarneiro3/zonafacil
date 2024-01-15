import { Component, Input, OnInit, Renderer, ViewChild } from '@angular/core';

import { User } from "../../models/user";

import { UserProvider } from "../../providers/user/user";

import { Constants } from "../../environments/constants";

@Component({
    selector: 'accordion',
    templateUrl: 'accordion.html'
})
export class AccordionComponent implements OnInit {

    accordionExpanded: boolean = false;
    optionSelected: string = 'Sim';
    checkedSim: boolean = true;
    checkedNao: boolean = false;

    @Input("title") title;
    @Input("configuration") configuration;
    @Input("value") value;
    @Input("user") user;

    @ViewChild("checkboxs") checkboxs: any;

    constructor(public renderer: Renderer, private userProvider: UserProvider) {
    }

    ngOnInit() {
        this.renderer.setElementStyle(this.checkboxs.nativeElement, "webkitTransition", "max-height 100ms, padding 500ms");
        if (this.value) {
            this.optionSelected = 'Sim';
            this.checkedNao = false;
            this.checkedSim = true;
        } else {
            this.optionSelected = 'Não';
            this.checkedSim = false;
            this.checkedNao = true;
        }
    }

    toggleAccordion() {
        if (this.accordionExpanded) {
            this.renderer.setElementStyle(this.checkboxs.nativeElement, "max-height", "0px");
            this.renderer.setElementStyle(this.checkboxs.nativeElement, "display", "none");
        } else {
            this.renderer.setElementStyle(this.checkboxs.nativeElement, "max-height", "200px");
            this.renderer.setElementStyle(this.checkboxs.nativeElement, "display", "block");
        }

        this.accordionExpanded = !this.accordionExpanded;
    }

    configuracaoSelecionada(option) {
        if (option === 'Sim') {
            this.optionSelected = option;
            this.checkedNao = false;
            this.checkedSim = true;
            this.updateConfiguration(true);

        } else if (option === 'Não') {
            this.optionSelected = option;
            this.checkedSim = false;
            this.checkedNao = true;
            this.updateConfiguration(false);
        }
    }

    updateConfiguration(optionValue) {
        switch (this.configuration) {
            case Constants.ATIVATION_EXPIRATION:
                this.user.configuracao.ativacao_expiracao = optionValue;
                this.update(this.user);
                break;
            case Constants.ALERT_FIVE_MINUTES:
                this.user.configuracao.alerta_5_minutos = optionValue;
                this.update(this.user);
                break;
            case Constants.ALERT_TEN_MINUTES:
                this.user.configuracao.alerta_10_minutos = optionValue;
                this.update(this.user);
                break;
            case Constants.ALERT_FIVETEEN_MINUTES:
                this.user.configuracao.alerta_15_minutos = optionValue;
                break;
        }
    }

    update(user: User) {
        this.userProvider.saveUser(user);
    }

}
