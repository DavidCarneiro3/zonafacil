import { LogoBase64Util } from './logobase64.util';

export class PDFUtil {

    public static gerarPDF(comprovante, sit) {
        let image = LogoBase64Util.getLogo();
        let numberPDV = "PDV nº " + comprovante.numberPDV;
        let numberAuth = "AUTENTICAÇÃO nº " + comprovante.numberAuth;
        let dateHour = "DATA " + comprovante.data + " - HORÁRIO " + comprovante.horario;
        let placa = "PLACA: " + comprovante.placa;
        let value = "VALOR: R$ " + comprovante.valor + ",00";
        let cad = "CAD(s): " + comprovante.cads + " de " + comprovante.tempoComprado + " MINUTOS CADA";
        let formaPgto = "CARTÃO DE CRÉDITO";
        let situacao = "Situação: "+sit;

        let conteudo = [];
        conteudo.push({ text: 'ESTACIONAMENTO ROTATIVO FORTALEZA', style: 'header' });
        conteudo.push({ text: 'CARTÃO AZUL DIGITAL', style: 'header' });
        conteudo.push({ image: image, width: 200, height: 200, alignment: 'center', margin: [0, 20, 0, 0] });
        conteudo.push({ text: 'COMPROVANTE DE PAGAMENTO', style: 'contentTitle' });

        if (comprovante.isPDV) {
            conteudo.push({ text: numberPDV, style: 'contentBody' });
        }

        conteudo.push({ text: numberAuth, style: 'contentBody' });
        conteudo.push({ text: dateHour, style: 'contentBody' });
        conteudo.push({ text: placa, style: 'contentBody' });
        conteudo.push({ text: value, style: 'contentBody' });
        conteudo.push({ text: 'FORMA DE PAGAMENTO: ' + formaPgto, style: 'contentBody' });
        conteudo.push({ text: cad, style: 'contentBody' });
        conteudo.push({ text: situacao, style: 'contentBody' });

        conteudo.push({ text: 'DISTRIBUIDOR', style: 'contentTitle' });
        conteudo.push({ text: 'CNPJ: ' + comprovante.distribuidorCnpj, style: 'contentBody' });
        conteudo.push({ text: 'Razão Social: ' + comprovante.distribuidorRazaoSocial, style: 'contentBody' });
        conteudo.push({ text: comprovante.distribuidorEndereco + ", CEP: " + comprovante.distribuidorCep, style: 'contentBody' });
        // conteudo.push({ text: 'LEGISLAÇÃO: Estacionamento Regulamentado pelos Decretos nº ________ de DIA/MÊS/ANO', style: 'contentBody' });

        conteudo.push({ text: 'INSTRUÇÕES PARA UTILIZAÇÃO DO CARTÃO AZUL DIGITAL', style: 'contentTitle' });
        conteudo.push({ text: comprovante.regras, style: 'contentBody' });
        

        // conteudo.push({text: 'DÚVIDAS, RECLAMAÇÕES E SUGESTÕES:', style: 'contentTitle'});
        // conteudo.push({text: 'Fone: 156', style: 'contentBody'});
        // conteudo.push({text: 'WEBSITE: http://www.fortaleza.ce.gov.br', link: 'http://www.fortaleza.ce.gov.br', style: 'contentBody'});

        return {
            content: [{ columns: [conteudo] }],
            styles: {
                header: {
                    bold: true,
                    fontSize: 16,
                    alignment: 'center'
                },
                contentTitle: {
                    bold: true,
                    fontSize: 12,
                    alignment: 'left',
                    margin: [0, 20, 0, 20]
                },
                contentBody: {
                    fontSize: 10,
                    alignment: 'justify',
                    margin: [0, 5, 0, 5]
                },
            },
            pageSize: 'A4',
            pageOrientation: 'portrait'
        };
    }
}