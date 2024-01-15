export class PagamentoModel {
  id: string;
  nome: string;
  numero: string;
  mes: string;
  ano: string;
  cpf: string;
  ccv: string;
  data: string;

  constructor()
  constructor(obj: any)
  constructor(obj?: any) {
    if(obj && obj.id){
      this.id = obj && obj.id || '';
    } else{
      this.id = obj && obj.$key || '';
    }

    this.nome = obj && obj.nome || '';
    this.numero = obj && obj.numero || '';
    this.mes = obj && obj.mes || '';
    this.ano = obj && obj.ano || '';
    this.cpf = obj && obj.cpf || '';
    this.ccv = obj && obj.ccv || '';
    this.data = obj && obj.data || new Date().toISOString();
  }

}
