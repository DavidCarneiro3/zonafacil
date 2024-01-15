import {PagamentoModel} from "../pagamento";

export class CardPagarmeModel {
    card_number: string;
    card_holder_name: string;
    card_expiration_date: string;
    card_cvv: string;
    cpf: string;

    constructor() {
    }

    static fromCardModel(pagamento: PagamentoModel) {

        // let split = pagamento.data.split('/');
        // let mes = Number(split[0]);
        // let ano = split[1];
        let _data = new Date(pagamento.data);

        let card = new CardPagarmeModel();
        card.card_number = pagamento.numero;
        // card.card_expiration_date = this.putZero(mes) + '' + ano;
        card.card_expiration_date = this.putZero(_data.getMonth()+1) + '' + _data.getFullYear();
        card.card_cvv = pagamento.ccv;
        card.card_holder_name = pagamento.nome;
        card.cpf = pagamento.cpf;

        return card;
    }

    private static putZero(mes: number) {
        // mes += 1;

        if (mes < 10)
            return '0' + mes;

        return '' + mes;
    }
}