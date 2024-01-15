export class AreaModel {

    codigo: string;
    endereco: string;
    regras: string;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        if(obj && obj.codigo){
            this.codigo = obj && obj.codigo || '';
        } else{
            this.codigo = obj && obj.$key || '';
        }

        this.codigo = obj && obj.codigo || '';
        this.endereco = obj && obj.endereco || '';
        this.regras = obj.regras && obj.regras || '';
    }

}