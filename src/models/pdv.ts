export class Pdv{
    email:string;
    name:string;
    phone:string;
    modalidade:string;
    rSocial:string;
    cnpj:string;
    insMun:string;
    endereco:string;
    cep:string;
    empPhone:string;
    empEmail:string;
    documento:string;

    constructor()
    constructor(obj:any)
    constructor(obj?:any){
            this.modalidade = obj && obj.modalidade || '';
            this.rSocial = obj && obj.rSocial || '';
            this.cnpj = obj && obj.cnpj || '';
            this.insMun = obj && obj.insMun || '';
            this.endereco = obj && obj.endereco || '';
            this.cep = obj && obj.cep || '';
            this.empPhone = obj && obj.empPhone || '';
            this.empEmail = obj && obj.empEmail || '';
            this.documento = obj && obj.documento || '';
    }
}

