import *  as convert from "xml-js" ;

export class XML2JSONUtil {

    static test(xml){
        xml =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<note importance="high" logged="true">' +
        '    <title>Happy</title>' +
        '    <todo>Work</todo>' +
        '    <todo>Play</todo>' +
        '</note>';
        // var result1 = convert.xml2json(xml, {compact: true, spaces: 4});
        // var result2 = convert.xml2json(xml, {compact: false, spaces: 4});
        // console.log(result1, '\n', result2);
    }

    /**
     * Funcao usada na callback do HTTP POST
     */
    static parseHttpXmlResponse(xml: string){
        // console.log('RESP XML RAW', xml);
        
        const prettyXml = XML2JSONUtil.limpaCampos(xml);
        // console.log('RESP XML PRETTY', prettyXml);
        
        const rawJson = XML2JSONUtil.parse(prettyXml);
        // console.log('RESP JSON RAW', rawJson);

        const prettyJson = XML2JSONUtil.parseResponse(rawJson);
        // console.log('RESP JSON PRETTY', prettyJson);

        return prettyJson;
    }

    /**
     * Converte de XML para JSON nao legivel
     */
    static limpaCampos(xml: string, limitador='</Resultado'){
        return xml.substring(0, xml.indexOf(limitador));
    }

    /**
     * Converte de XML para JSON nao legivel
     */
    static parse(xml: string){
        // console.log('RESP JSON', xml);
        return convert.xml2js(xml);
    }

    /**
     * Converte o JSON do XML para o JSON mais legivel
     */
    private static parseResponse(json: convert.ElementCompact){
        let result = {};

        json.elements.forEach(_element => {
            // const resultado = _element.name; // Tag Resultado
            // console.log('resultado',resultado);
            
            _element.elements.forEach(_subElement => {
                const tag = _subElement.name; // Tag atributo
                // console.log('tag',tag);

                if(_subElement.elements){
                    const textArr = _subElement.elements.map(_item => _item ? _item.text : undefined);
                    // console.log('textArr',textArr);
                    let text = textArr.length > 0 ? textArr[0].trim() : undefined;
                    
                    
                    if(XML2JSONUtil.isNumeric(text)){
                        if(tag !== 'autenticacao'){
                            text = parseInt(text);
                        }
                    } else if(text === 'true'){
                        text = true;
                    } else if(text === 'false'){
                        text = false;
                    }

                    result[tag] = text;
                }
            })
        });

        return result;
    }

    static isNumeric(num){
        return !isNaN(num)
    }

}