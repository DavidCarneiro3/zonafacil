
export class StatusPagarmeModel {

    constructor() { }

    static getStatusTraduzido(statusPagarMe) {
        switch (statusPagarMe) {
            case 'processing':
                return {icon: 'ios-timer-outline', desc: 'Processando Pagamento', color: '#737373'};
            case 'authorized':
                return {icon: 'ios-checkmark-outline', desc: 'Autorizado', color: '#737373'};
            case 'paid':
                return {icon: 'ios-done-all-outline', desc: 'Pago', color: '#00ff5d'};
            case 'refunded':
                return {icon: 'ios-undo-outline', desc: 'Estornado', color: '#737373'};
            case 'waiting_payment': // Boleto
                return {icon: 'ios-timer-outline', desc: 'Aguardando Pagamento', color: '#737373'};
            case 'pending_refund': // Boleto
                return {icon: 'ios-return-left-outline', desc: 'Pagamento Reembolsado', color: '#00d7f8'};
            case 'refused':
                return {icon: 'ios-close-outline', desc: 'Pagamento Recusado', color: '#f8071d'};
            default:
                return {icon: undefined, desc: undefined, color: '#737373'};
        }
    }
}