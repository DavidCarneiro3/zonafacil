import * as firebase from 'firebase/app';

export class CadUserModel {
    dataHoraCompra: any;
    qtdCads: number;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.dataHoraCompra = obj && obj.dataHoraCompra || firebase.database.ServerValue.TIMESTAMP;
        this.qtdCads = obj && obj.qtdCads || 0;
    }
}