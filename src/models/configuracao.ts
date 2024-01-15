export class ConfiguracaoModel {
    alerta_30_minutos: boolean;
    alerta_25_minutos: boolean;
    alerta_20_minutos: boolean;
    alerta_15_minutos: boolean;
    alerta_10_minutos: boolean;
    alerta_5_minutos: boolean;
    ativacao_expiracao: boolean;

    constructor()
    constructor(obj)
    constructor(obj?) {
        this.alerta_30_minutos = obj && obj.alerta_30_minutos || false;
        this.alerta_25_minutos = obj && obj.alerta_25_minutos || false;
        this.alerta_20_minutos = obj && obj.alerta_20_minutos || false;
        this.alerta_15_minutos = obj && obj.alerta_15_minutos || true;
        this.alerta_10_minutos = obj && obj.alerta_10_minutos || true;
        this.alerta_5_minutos = obj && obj.alerta_5_minutos || true;
        this.ativacao_expiracao = obj && obj.ativacao_expiracao || true;
    }
}