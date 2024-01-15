import * as firebase from 'firebase/app';

export class EstacionarModel {

    static UM_MINUTO_EM_MILIS = 60000; // 1min = 60000 milisegundos

    id: string;
    area_id: string;
    face_id: string;
    setor_id: string;
    veiculo_id: string;
    dataHoraRegistro: any;
    tempoEstacionado: any;
    qtd: number;
    tempoComprado: any;
    cidade: string;
    situacao: string;
    status: boolean;
    cancelado: boolean;
    categoria: string;
    codAuth: string;
    uidAparelho: string;
    comprovante: any;
    idTransacaoDistribuidor: number;
    dadosCancelamento: CanceladoModel;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        // let date = firebase.database.ServerValue.TIMESTAMP;

        if (obj && obj.id) {
            this.id = obj && obj.id || '';
        } else {
            this.id = obj && obj.$key || '';
        }

        this.area_id = obj && obj.area_id || '';
        this.setor_id = obj && obj.setor_id || '';
        this.face_id = obj && obj.face_id || '';
        this.veiculo_id = obj && obj.veiculo_id || '';
        this.dataHoraRegistro = obj && obj.dataHoraRegistro || firebase.database.ServerValue.TIMESTAMP;
        this.qtd = obj && obj.qtd || 0;
        this.status = obj && obj.status || true;
        this.cancelado = (obj && obj.cancelado) ? obj.cancelado : false;
        this.cidade = obj && obj.cidade || 'Fortaleza';
        this.situacao = obj && obj.situacao || 'Ativação';
        this.categoria = obj && obj.categoria || '';
        this.codAuth = obj && obj.codAuth || '';
        this.uidAparelho = obj && obj.uidAparelho || '';
        this.comprovante = obj && obj.comprovante || {};
        this.dadosCancelamento = obj && obj.dadosCancelamento || {};
        this.tempoComprado = obj && obj.tempoComprado || 0;
        this.idTransacaoDistribuidor = obj && obj.idTransacaoDistribuidor || 1;
    }

    static getHoraEmMilis(qtd = 1, tempoCadMinutos: number) {
        // return qtd*1200000;
        return qtd * tempoCadMinutos * EstacionarModel.UM_MINUTO_EM_MILIS;
    }

    resetDataHoraRegistro() {
        this.dataHoraRegistro = firebase.database.ServerValue.TIMESTAMP;
    }

}

export class CanceladoModel {

    dataHoraRegistro: any;
    motivoCancelamento: string;
    autenticacao: string;
    idTransacaoDistribuidorCancelamento: number;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.dataHoraRegistro = obj && obj.dataHoraRegistro || firebase.database.ServerValue.TIMESTAMP;
        this.motivoCancelamento = obj && obj.motivoCancelamento || '';
        this.autenticacao = obj && obj.autenticacao || '';
        this.idTransacaoDistribuidorCancelamento = obj && obj.idTransacaoDistribuidorCancelamento || 0;
    }

}