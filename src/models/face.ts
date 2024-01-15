export class FaceModel {
    codigo: string;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        if(obj && obj.codigo){
            this.codigo = obj && obj.codigo || '';
        } else{
            this.codigo = obj && obj.$key || '';
        }
    }
}