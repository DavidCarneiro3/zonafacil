export class CadModel {
    id: string;
    qtd_por_usuario: number;
    total: number;
    valor_unitario: number;
    tempo_veiculo: TempoModel;
    tempo_caminhao: TempoModel;
    regras: string;
    gateway: string;
    regras_comprovante: string;
    info: InfoModel;
    empresa: EmpresaModel;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        if(obj && obj.id){
            this.id = obj && obj.id || '';
        } else{
            this.id = obj && obj.$key || '';
        }

        this.qtd_por_usuario = obj && obj.qtd_por_usuario || 3;
        this.total = obj && obj.total || 200;
        this.valor_unitario = obj && obj.valor_unitario || 2;
        this.regras = obj && obj.regras || '';
        this.gateway = obj && obj.gateway || '';
        this.regras_comprovante = obj && obj.regras_comprovante || '';
        this.info = obj && obj.info || new InfoModel();
        this.empresa = obj && obj.empresa || new EmpresaModel();
        this.tempo_veiculo = obj && obj.tempo_veiculo || new TempoModel();
        this.tempo_caminhao = obj && obj.tempo_caminhao || new TempoModel();
    }
}

export class InfoModel {
    email_comprovante: string;
    email: string;
    fone: string;
    site: string;
    facebook_url: string;
    google_url: string;
    google_store: string;
    apple_store: string;
    twitter_url: string;
    info_page: string;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.email_comprovante = obj && obj.email_comprovante || '';
        this.email = obj && obj.email || '';
        this.fone = obj && obj.fone || '';
        this.site = obj && obj.site || '';
        this.facebook_url = obj && obj.facebook_url || '';
        this.google_url = obj && obj.google_url || '';
        this.google_store = obj && obj.google_store || '';
        this.apple_store = obj && obj.apple_store || '';
        this.twitter_url = obj && obj.twitter_url || '';
        this.info_page = obj && obj.info_page || '';
    }
}

export class TempoModel {
    qtdMinutos: number;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.qtdMinutos = obj && obj.qtdMinutos || 0;
    }
}

export class EmpresaModel {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    logradouro: string;
    logradouro_numero: number;
    cep: string;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.cnpj = obj && obj.cnpj || '';
        this.razao_social = obj && obj.razao_social || '';
        this.nome_fantasia = obj && obj.nome_fantasia || '';
        this.logradouro = obj && obj.logradouro || '';
        this.logradouro_numero = obj && obj.logradouro_numero || '';
        this.cep = obj && obj.cep || '';
    }
}