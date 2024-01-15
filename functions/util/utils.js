const unirest = require("unirest");
const moment = require('moment');
const XMLJSON = require('xml-js');
const MD5 = require('js-md5');

const cnpj = '05591991000148';
const TOKEN = `af777ebfab40209d52e5500fd5582214`;
const UM_MINUTO_EM_MILES = 60000;

module.exports = {
    /**
    * Executa um post na URL especificada com os parametros
    * @param {* string } _url url base do post 
    * @param {*} _body conteúdo do post
    * @param {*} _headers headers para a autenticação ou os outros dados referente ao cabeçalho do post
    * @param {* function } _successCallback call Back quando o codigo a resposta for sucesso
    * @param {*} _errorCallback call back qaundo retornar erro
    */
    sendPost: (_url, _body, _headers, _successCallback, _errorCallback) => {
        unirest.post(_url)
            .headers(_headers)
            .send(_body)
            .strictSSL(false)
            .end(function (response) {
                if (response.error) {
                    _errorCallback(response.error);
                } else {
                    _successCallback(response.body);
                }
            });
    },
    /**
    * 
    * @param {moment} date data atual
    * @returns data em number formatado em "dma" (sem barras ou caracteres e sem zeros a esquerda) 
    */
    getDataAtual: (date = moment()) => {
        return parseInt(date.date() + '' + (date.month() + 1) + date.year())
    },
    generateDate: () => {
        //  pega o tempo, -3 pq a function é executada na GMT - 3 e formata no padrão YYYY - MM - DDTHH - MM - SS
        const now = moment().utcOffset(-3).toISOString(true).substr(0, 19)
        const hour = now.substring(11, 13)
        return { now: now, hour: hour }
    },
    /**
     * @returns data formatado DD/MM/AAAA
     */
    formateDate: (data) => {
        return moment(data).format('DD/MM/YYYY')
    },
    snapshotToArr: (snapshot) => {
        var arr = [];

        snapshot.forEach(_snapshot => {
            var item = _snapshot.val();
            item.key = _snapshot.key;

            arr.push(item);
        });

        return arr;
    },
    objToArr: (objArr) => {
        var arr = [];

        Object.keys(objArr).forEach(key => {
            var item = objArr[key];

            Object.keys(item).forEach(key2 => {
                var item2 = item[key2];
                if (key2 !== 'key') {
                    arr.push(item2);
                }
            });

        });

        return arr;
    },
    isNumeric: (num) => {
        return !isNaN(num)
    },
    /**
    * Gera um comprovante para ser salvo no banco quando o agendamento der certo
    * @param {json} respostaAMC resposta com os dados da AMC
    * @param {json} estacionar  dados do comprovantes que vai ser adicionado no banco
    * @returns json contento um objecto estacionar a ser gravado no firebase
    */
    _makeComprovante: (respostaAMC, estacionar) => {
        const estacionamento = {
            "area_id": estacionar.codigoArea,
            "cancelado": false,
            "categoria": estacionar.categoria,
            "cidade": 'Fortaleza',
            "codAuth": respostaAMC.autenticacao,
            "comprovante": {
                "cads": estacionar.quantidade,
                //     "cep":,
                //     "comprovanteEmail":,
                "data": module.exports.formateDate(respostaAMC.dataProcessamento),
                "distribuidorCep": "6070-001",
                "distribuidorCnpj": '05.591.991/0001-48',
                "distribuidoeEndereco": "AV GODOFREDO MACIEL, 2841",
                "distribuidorNomeFantasia": "CIPETRAN-CE",
                "distribuidorRazaoSocial": "NECAVA INSPECAO E PESQUISA EM TRANSPORTES LTDA - ME",
                //     "endereco": "",
                //     "formaPagamento": "",
                'placa': estacionar.placa,
                'tipo_veiculo': estacionar.categoria
            },
            "dataHoraRegistro": moment(respostaAMC.dataHoraRegistro).utcOffset(-3).valueOf(),
            "face_id": "A",
            "id": estacionar.id,
            "idTransacaoDistribuidor": estacionar.idTransacaoDistribuidor,
            "qtd": estacionar.quantidade,
            "setor_id": estacionar.codigoSetor,
            "situacao": 'Ativação',
            "status": true,
            "tempoComprado": estacionar.tempoComprado,
            "tempoEstacionado": moment(respostaAMC.dataHoraRegistro).utcOffset(-3).valueOf() + (UM_MINUTO_EM_MILES * estacionar.quantidade * estacionar.tempoComprado),
            "uidAparelho": estacionar.udid_imei,
            "veiculo_id": estacionar.veiculo_id,
        }

        return estacionamento
    },
    /**
 * Transaforma um objecto Json em um XML 
 * @param {* JSON} agenda Json com os dados para transformar em Xml 
 * @returns XML usado para fazer requesição
 */
    _makeXML: (agenda) => {
        const tipoVeiculo = agenda.tipoVeiculo === 'carga_descarga' ? 2 : 1
        const imeiTitle = (agenda.udid_imei.indexOf('-') > 0) ? 'udid' : 'imei';
        const tipo = 2;

        const xml = `
    <transacao>
    <codigoDistribuidor>${62}</codigoDistribuidor>
      <dataEnvio>${agenda.dataEnvio}</dataEnvio>
      <tipo>${tipo}</tipo>
      <idTransacaoDistribuidor>${agenda.idTransacaoDistribuidor}</idTransacaoDistribuidor>
      <cnpj>${cnpj}</cnpj>
      <${imeiTitle}>${agenda.udid_imei}</${imeiTitle}>
      <area>${agenda.codigoArea}</area>
      <setor>${agenda.codigoSetor}</setor>
      <face>${'A'}</face>
      <latitude>${agenda.lat}</latitude>
      <longitude>${agenda.long}</longitude>
      <placa>${agenda.placa}</placa>
      <tipoVeiculo>${tipoVeiculo}</tipoVeiculo>
      <tempoCartao>${agenda.tempoComprado}</tempoCartao>
      <quantidadeCartoes>${agenda.quantidade}</quantidadeCartoes>
    </transacao>
    `;
        return encodeURI(xml)
    },

    /**
    * Funcao usada na callback do HTTP POST
    */
    parseHttpXmlResponse: (xml) => {
        // console.log('RESP XML RAW', xml);

        const prettyXml = module.exports.limpaCampos(xml);
        // console.log('RESP XML PRETTY', prettyXml);

        const rawJson = module.exports.parse(prettyXml);
        // console.log('RESP JSON RAW', rawJson);

        const prettyJson = module.exports.parseResponse(rawJson);
        // console.log('RESP JSON PRETTY', prettyJson);

        return prettyJson;
    },

    /**
    * Converte de XML para JSON nao legivel
    */
    limpaCampos: (xml, limitador = '</Resultado') => {
        return xml.substring(0, xml.indexOf(limitador));
    },

    /**
        * Converte de XML para JSON nao legivel
        */
    parse: (xml) => {
        return XMLJSON.xml2js(xml);
    },


    /**
     * Converte o JSON do XML para o JSON mais legivel
     */
    parseResponse: (json) => {
        let result = {};

        json.elements.forEach(_element => {

            _element.elements.forEach(_subElement => {
                const tag = _subElement.name; // Tag atributo

                if (_subElement.elements) {
                    const textArr = _subElement.elements.map(_item => _item ? _item.text : undefined);
                    let text = textArr.length > 0 ? textArr[0].trim() : undefined;


                    if (module.exports.isNumeric(text)) {
                        if (tag !== 'autenticacao') {
                            text = parseInt(text);
                        }
                    } else if (text === 'true') {
                        text = true;
                    } else if (text === 'false') {
                        text = false;
                    }

                    result[tag] = text;
                }
            })
        });

        return result;
    },

    /**
     * 
     * @param {*} cod 
     * @param {*} cnpj 
     * @param {*} dma 
     * @param {*} token 
     */
    gerarMD5: (cod, cnpj, dma, token) => {
        const md5 = MD5(`${cod}${cnpj}${dma}${token}`);
        return md5
    },
    gerarCodigoAcesso: (codigoCliente) => {
        return module.exports.gerarMD5(codigoCliente, cnpj, module.exports.getDataAtual(), TOKEN);
    },

    makeComprovanteEmail(data) {

        const comprovante = data;
        const from = comprovante.from;
        let htmlContent = '';
        const distribuidorCNPJ = 'CNPJ: 05.591.991/0001-48';
        const distribuidorRazaoSocial = ` NECAVA INSPECAO E PESQUISA EM TRANSPORTES LTDA - ME
        AV GODOFREDO MACIEL, 2841, CEP: 60710-001`;
        const site = 'http://www.zonafacil.com.br/';
        const regras = `O usuário deve sempre observar a placa de sinalização para verifcar o horário de funcionamento e o tempo de
        validade do Cartão. Como regra geral 1 Cartão é válido para estacionar o veículo por 1 hora, no entanto, em alguns
        locais o tempo de validade do Cartão é diferenciado. É permitido usar no máximo 2 Cartões na mesma vaga, sendo
        obrigatória a retirada do veículo ao término do período. Para os casos em que o horário do comprovante for anterior
        ao horário que consta da placa de sinalização, prevalecerá a informação constante da sinalização. Este
        comprovante de pagamento não precisa ser deixado no painel do veículo.`
        const distribuidorPhone = "(85) 3296.7000"

        if (from == 'estacionar') {

            const numberAuth = comprovante.numberAuth;
            const dateHour = comprovante.dateHour;
            // const placa = comprovante.placa;
            const value = comprovante.value;
            const cad = comprovante.cad;
            const userFone = comprovante.userFone;
            const placa = comprovante.placa;
            // const formaPagamento = comprovante.formaPagamento;
            const comprovanteEmail = comprovante.comprovanteEmail;

            htmlContent += `<h1>ESTACIONAMENTO ROTATIVO FORTALEZA</h1>`;
            // htmlContent += `<h2>CARTÃO AZUL DIGITAL</h2>`;
            htmlContent += `<h2>COMPROVANTE DE ESTACIONAMENTO</h2>`;
            htmlContent += `<p>${numberAuth}</p>`;
            htmlContent += `<p>${dateHour}</p>`;
            htmlContent += `<p>${placa}</p>`;
            htmlContent += `<p>${value}</p>`;
            htmlContent += `<p>${cad}</p>`;
            htmlContent += `<h3>DISTRIBUIDOR</h3>`;
            htmlContent += `<p>${distribuidorCNPJ}</p>`;
            htmlContent += `<p>Razão Social: ${distribuidorRazaoSocial}</p>`
            htmlContent += `<h3>INSTRUÇÕES PARA UTILIZAÇÃO DO CARTÃO AZUL DIGITAL</h3>`;
            htmlContent += `<p style="text-align:justify">${regras}</p>`;
            htmlContent += `<h3>DÚVIDAS, RECLAMAÇÕES E SUGESTÕES:</h3>`;
            htmlContent += `<p>Fone: ${distribuidorPhone}</p>`;
            htmlContent += `<a href="${site}">${site}</a>`;

            return htmlContent
        } else {
            const numberAuth = comprovante.numberAuth;
            const dateHour = comprovante.datehour;
            const cads = comprovante.cads;
            const formaPagamento = comprovante.formaPagamento;
            const value = comprovante.value

            htmlContent += `<h1>ESTACIONAMENTO ROTATIVO FORTALEZA</h1>`;
            htmlContent += `<h2>CARTÃO AZUL DIGITAL</h2>`;
            htmlContent += `<h3> COMPROVANTE DE COMPRA</h3>`
            htmlContent += `<p>${numberAuth}</p>`;
            htmlContent += `<p>${dateHour}</p>`;
            htmlContent += `<p>${formaPagamento}</p>`;
            htmlContent += `<p>${value}</p>`;
            htmlContent += `<p>${cads}</p>`;
            htmlContent += `<h3>DISTRIBUIDOR</h3>`;
            htmlContent += `<p>${distribuidorCNPJ}</p>`;
            htmlContent += `<p>Razão Social: ${distribuidorRazaoSocial}</p>`
            htmlContent += `<h3>INSTRUÇÕES PARA UTILIZAÇÃO DO CARTÃO AZUL DIGITAL</h3>`;
            htmlContent += `<p style="text-align:justify">${regras}</p>`;
            htmlContent += `<h3>DÚVIDAS, RECLAMAÇÕES E SUGESTÕES:</h3>`;
            htmlContent += `<p>Fone: ${distribuidorPhone}</p>`;
            htmlContent += `<a href="${site}">${site}</a>`;

            return htmlContent;
        }
    }

}