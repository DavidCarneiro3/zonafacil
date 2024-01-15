export class AgendarEstacionamentoModel {
    id: string
    userID: string; // Saber aonde salvar o estacionamento quando bater a hora

    // Dados utilizados para estacionar o veiculo
    lat: number;
    long: number;
    codigoArea: number;
    codigoSetor: number;
    placa: string;
    categoria: string;
    tempoComprado: number;
    quantidade: number;
    idTransacaoDistribuidor: number;
    udid_imei: string;
    veiculo_id: string;
    // Verificar o status do estacionamento
    time: number;
    // categoria: string;
    sucess: boolean;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        if (obj && obj.id) {
            this.id = obj && obj.id || ''
        } else {
            this.id = obj && obj.$key || '';
        }
        this.userID = obj && obj.userID || '';
        this.lat = obj && obj.lat || 0;
        this.long = obj && obj.long || 0;
        this.codigoArea = obj && obj.codigoArea || 0;
        this.codigoSetor = obj && obj.codigoSetor || 0;
        this.placa = obj && obj.placa || '';
        this.categoria = obj && obj.categoria || 'normal';
        this.tempoComprado = obj && obj.tempoComprado || 0;
        this.quantidade = obj && obj.quantidade || 1;
        this.idTransacaoDistribuidor = obj && obj.idTransacaoDistribuidor || 0;
        this.udid_imei = obj && obj.udid_imei || '';
        this.veiculo_id = obj && obj.veiculo_id || '';

        this.sucess = obj && obj.sucess || false;
        // this.categoria = obj && obj.categoria || '';
        this.time = obj && obj.time || null;

    }
}