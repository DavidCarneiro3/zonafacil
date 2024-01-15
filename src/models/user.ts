import {ConfiguracaoModel} from "./configuracao";
import {Pdv} from "./pdv"
export class User {
  id: string;
  dateOfBirth: Date;
  name: string;
  email: string;
  profile: string;
  phone: string;
  photo: string;
  sex: string;
  cpf: string;
  status: boolean;
  configuracao: ConfiguracaoModel;
  pdvReg:Pdv;
  uidPDV: string;
  uidAparelho: string;
  endereco: string;
  cep: string;
  contato: string;
  notificationKey: string;
  percent: number;

  constructor()
  constructor(obj: any)
  constructor(obj?: any) {
    if(obj && obj.id){
      this.id = obj && obj.id || '';
    } else{
      this.id = obj && obj.$key || '';
    }

    if(obj && obj.photo && obj.photo !== ''){
      this.photo = obj.photo;
    } else{
      this.photo = 'assets/imgs/user.svg';
    }

    this.name = obj && obj.name || '';
    this.email = obj && obj.email || '';
    this.phone = obj && obj.phone || '';
    this.sex = obj && obj.sex || 'Masculino';
    this.dateOfBirth = obj && obj.dateOfBirth || this.getDateOfBirth();
    this.status = obj && obj.status || false;
    this.profile = obj && obj.profile || 'user';
    this.cpf = obj && obj.cpf || '';
    this.configuracao = obj && obj.configuracao || new ConfiguracaoModel();
    this.pdvReg = obj && obj.pdvReg || new Pdv() ;
    this.uidPDV = obj && obj.uidPDV || '00000000000';
    this.uidAparelho = obj && obj.uidAparelho || '';
    this.endereco = obj && obj.endereco || '';
    this.cep = obj && obj.cep || '';
    this.contato = obj && obj.contato || '';
    this.cep = obj && obj.cep || '';
    this.percent = obj && obj.percent || 0;
    this.notificationKey = obj && obj.notificationKey || '';
  }

  getDateOfBirth() {
    let date = new Date();
    date.setHours(10);
    return date.toISOString();
  }

}
