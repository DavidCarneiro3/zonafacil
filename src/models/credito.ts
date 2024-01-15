import * as firebase from 'firebase/app';
import { CanceladoModel } from './estacionar';

export class CreditoModel {
    id: string;
    pagamento_id: string;
    dataHoraRegistro: any;
    valor: number;
    valorSemDesconto: number;
    desconto: number;
    descontoPercent: number;
    cartao: string;
    numero: string;
    status: string;
    autenticacao: string;
    idTransacao: number;
    dadoCancelamento: CanceladoModel;
    idCompra:number;
    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        if (obj && obj.id) {
            this.id = obj && obj.id || '';
        } else {
            this.id = obj && obj.$key || '';
        }

        this.pagamento_id = obj && obj.pagamento_id || '';
        this.dataHoraRegistro = obj && obj.dataHoraRegistro || firebase.database.ServerValue.TIMESTAMP;
        this.valor = obj && obj.valor || 0;
        this.valorSemDesconto = obj && obj.valorSemDesconto || 0;
        this.desconto = obj && obj.desconto || 0;
        this.descontoPercent = obj && obj.descontoPercent || 0;
        this.cartao = obj && obj.cartao || '';
        this.numero = obj && obj.numero || '';
        this.status = obj && obj.status || 'Aquisição';
        this.autenticacao = obj && obj.autenticacao || '';
        this.idTransacao = obj && obj.idTransacao || '';
        this.idCompra = obj && obj.idCompra || '';
        this.dadoCancelamento = obj && obj.dadoCancelamento || {};
    }
}