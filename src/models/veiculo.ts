export class VeiculoModel {
  id: string;
  placa: string;
  tipo_veiculo: string;
  ano: string;
  marca: string;
  modelo: string;
  tipo_placa: string;

  constructor()
  constructor(obj: any)
  constructor(obj?: any) {
    if (obj && obj.id) {
      this.id = obj && obj.id || '';
    } else {
      this.id = obj && obj.$key || '';
    }

    this.placa = obj && obj.placa || '';
    this.tipo_veiculo = obj && obj.tipo_veiculo || 'automovel';
    this.ano = obj && obj.ano || '';
    this.marca = obj && obj.marca || 'Sem marca';
    this.modelo = obj && obj.modelo || 'Sem modelo';
    this.tipo_placa = obj && obj.tipo_placa || 'Padrão';
  }

  static getImage(tipo): string {
    switch (tipo) {
      // case 'moto':
      //   return 'assets/imgs/moto.png';
      case 'caminhao_onibus':
        return 'assets/imgs/truck.png';

      default:
        return 'assets/imgs/car.png';
    }
  }

  getTipoVeiculoID() {
    const tipo = this.tipo_veiculo.toLowerCase();

    switch (tipo) {
      // case 'moto':
      //   return 3;
      case 'caminhao_onibus':
        return 2;
      default:
        return 1;
    }
  }

  getPlacaNaoFormatada() {
    return this.placa ? this.placa.toUpperCase().replace('-', '') : '';
  }

}
