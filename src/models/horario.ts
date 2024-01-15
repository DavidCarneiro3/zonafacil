export class HorarioModel {
    dia: string;
    hora_fim: string;
    hora_inicio: string;
    isDisponivel: boolean;
    sequencial: number;
    isExibir: boolean;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.dia = obj.dia && obj.dia || '';
        this.hora_fim = obj.hora_fim && obj.hora_fim || '';
        this.hora_inicio = obj.hora_inicio && obj.hora_inicio || '';
        this.isDisponivel = obj.isDisponivel && obj.isDisponivel || true;
        this.sequencial = obj.sequencial && obj.sequencial || 0;

        this.isExibir = true;//this.canExibir();
    }

    /*private canExibir(){
        if(this.hora_inicio === '00:00' && this.hora_fim === '00:00')
            return false;

        return true;
    }*/
}