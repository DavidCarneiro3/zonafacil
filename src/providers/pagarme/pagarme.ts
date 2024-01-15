import { Injectable } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import pagarme from 'pagarme';

import { LoggerProvider } from '../logger/logger';

import { CreditoModel } from '../../models/credito';
import { CardPagarmeModel } from "../../models/pagarme/card-pagarme";
import { UserPagarmeModel } from "../../models/pagarme/user-pagarme";
import { VendaPagarmeModel } from "../../models/pagarme/venda-pagarme";

import { environment } from './../../environments/environment';

@Injectable()
export class PagarmeProvider {

    static PAGARME_API_PROD: string = "ak_live_fWyQBJhrvLmRTbQSuESRpBKAOuXL3I";
    static PAGARME_API_DEV: string = "ak_test_KkXzbnmyssmGQC2Esx6Sq6J5KilA6g";
    // static PAGARME_API_DEV: string = "ak_test_wAGrI8wvapRuUkiBHQPrQoQqrGstv9";
    static PAGARME_API: string = PagarmeProvider.PAGARME_API_DEV;

    constructor(public afd: AngularFireDatabase, private logger: LoggerProvider) {
        PagarmeProvider.PAGARME_API = environment.production ? PagarmeProvider.PAGARME_API_PROD : PagarmeProvider.PAGARME_API_DEV;
    }

    public pagar(card: CardPagarmeModel, comprador: UserPagarmeModel, venda: VendaPagarmeModel): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            // pega os erros de validação nos campos do form e a bandeira do cartão
            let cardValidations = pagarme.validate({ card: card })

            if (cardValidations.card.card_number) {
                this.logger.debug('número de cartão correto');
                // console.log('número de cartão correto');

                const transaction = this.criaTransaction(card, comprador, venda);
                this.logger.debug('transaction' + JSON.stringify(transaction));
                // console.log('transaction', transaction);

                pagarme.client.connect({ api_key: PagarmeProvider.PAGARME_API })
                    .then(client => client.transactions.create(transaction))
                    .then(transaction => { // enviar o para seu servidor
                        this.logger.debug(JSON.stringify(transaction));
                        console.log(transaction.id)
                        //this.processaPgto(comprador.id, transaction, valor, type);
                        resolve(transaction);
                    })
                    .catch(error => {
                        // console.log('error', error);
                        reject('Erro ao processar o pagamento! Verifique se seus dados foram preenchidos de forma correta.')
                    });

            } else {
                reject('Número de cartão inválido! Confira se seus dados foram preenchidos de forma correta e tente novamente.');
            }
        });
    }

    public estorno(credito: CreditoModel) {
        return new Promise<any>((resolve, reject) => {
            pagarme.client.connect({ api_key: PagarmeProvider.PAGARME_API })
                .then(client => client.transactions.refund({
                    id: credito.idCompra
                })
                    .then(response => {
                        resolve(response)
                    })
                    .catch(error => {
                        reject('deu ruim')
                    })
                )
        })
    }

    private criaTransaction(card: CardPagarmeModel, comprador: UserPagarmeModel, venda: VendaPagarmeModel) {
        return {
            // criar a transação/assinatura: https://pagarme.readme.io/reference#criar-transacao

            //Valor a ser cobrado
            amount: 100 * venda.price,

            // Informações do cartão do cliente criptografadas
            //Card Hash
            card_number: card.card_number,
            card_cvv: card.card_cvv,
            card_expiration_date: card.card_expiration_date,
            card_holder_name: card.card_holder_name,


            //Forma de Pagamento
            payment_method: "credit_card",
            // "installments": "1", // Número de parcelas da transação

            // dados do comprador
            customer: {
                external_id: comprador.id,
                name: comprador.name,
                type: "individual",
                country: "br",
                email: comprador.email,
                documents: [{ "type": "cpf", "number": comprador.cpf }],
                phone_numbers: [comprador.phone]
                // "birthday": comprador.birthday
            },

            // dados de cobrança
            billing: {
                name: "Zona Azul Fortaleza",
                address: {
                    country: "br",
                    state: "ce",
                    city: "Fortaleza",
                    neighborhood: "Papicu",
                    street: "R. Joaquim Lima", // endereco do rio mar
                    street_number: "150",
                    zipcode: "60175005"
                }
            },
            items: [ // dados dos itens vendidos
                {
                    id: venda.id,
                    title: venda.name,
                    unit_price: venda.price,
                    quantity: venda.qtd,
                    tangible: true,
                    date: venda.date
                }
            ]
        }
    }

    /*private processaPgto(userId, token: any, valor, categoria) {
        const payment = {
            token: token,
            valor: valor,
            categoria: categoria
        };

        return this.afd.list(`/${this.getEntity()}/${userId}`).update(token.tid.toString(), payment);
    }*/
}
