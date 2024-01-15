export class FunctionsUtil {

    public static checkCPF(cpf: string): boolean {
        let soma = 0;
        let resto = 0;

        cpf = cpf.replace(/[^\d]+/g, '');

        if (cpf == '') return false;

        if (cpf.length != 11) {
            return false;
        }

        if (cpf == '00000000000' || cpf == '11111111111' || cpf == '22222222222' || cpf == '33333333333' ||
            cpf == '44444444444' || cpf == '55555555555' || cpf == '66666666666' || cpf == '77777777777' ||
            cpf == '88888888888' || cpf == '99999999999') {
            return false;
        } else {
            for (let i = 1; i <= 9; i++) {
                soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
            }

            resto = (soma * 10) % 11;

            if ((resto == 10) || (resto == 11)) {
                resto = 0;
            }

            if (resto != parseInt(cpf.substring(9, 10))) {
                return false;
            }

            soma = 0;

            for (let i = 1; i <= 10; i++) {
                soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
            }

            resto = (soma * 10) % 11;

            if ((resto == 10) || (resto == 11)) {
                resto = 0;
            }

            if (resto != parseInt(cpf.substring(10, 11))) {
                return false;
            }

            return true;
        }
    }

    public static checkCNPJ(cnpj) {

        cnpj = cnpj.replace(/[^\d]+/g, '');

        if (cnpj == '') return false;

        if (cnpj.length != 14)
            return false;

        // Elimina CNPJs invalidos conhecidos
        if (cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999")
            return false;

        // Valida DVs
        let tamanho = cnpj.length - 2
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false;

        return true;

    }

    public static cleanBRMask(value: string) {
        return value.replace(/[^\d]+/g, '');
    }

    /**
     *  Retorna a distancia entre dois pontos 
     *  @param start Objecto contento a latitude e a longitude do ponto inicial
     *  @param end Objecto contendo a latitude e a longitude do ponto final
     *  @returns Distancia entre o ponto inicial e o ponto final em KM
     *  https://www.joshmorony.com/create-a-nearby-places-list-with-google-maps-in-ionic-2-part-2/
    */
    public static getDistanceBetweenPoints(start, end, units): number {
        if (start != 0 && end != 0) {
            let earthRadius = {
                miles: 3958.8,
                km: 6371
            };

            let R = earthRadius[units || 'km'];
            let startLatitude = start.lat;
            let startLongitude = start.lng;
            let endLatitude = end.lat;
            let endLongitude = end.lng;

            let dLat = this.toRadiano((endLatitude - startLatitude));
            let dLon = this.toRadiano((endLongitude - startLongitude));
            let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadiano(startLatitude)) * Math.cos(this.toRadiano(endLatitude)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let distance = R * c;

            return distance;
        }

        return undefined;
    }

    /**
     *  Converte graus para Radiano
     * @param x numero a ser convertido para o Radiano
     * @returns numero de entrada em Radianos
     */
    private static toRadiano(x): number {
        return x * Math.PI / 180;
    }


    /**
     * Verfica qual horario padrão o usuário deseja estacionar
     * @param horario horario em que vai acontecer o estacionamento
     * @param holidays lista com todos os feriados
     * @returns String informando em qual caso ele deseja estacionar fora do horario padrão
     */
    public static foraHorarioPadrão(horario: Date, holidays: any[]): string {
        const date = horario.toLocaleDateString()
        if (horario.getDay() === 0 || holidays.indexOf(date) > -1)
            return 'Domingo'
        if (horario.getDay() === 5 && horario.getHours() > 18)
            return 'Sexta'
        if (horario.getDay() === 6 && horario.getHours() > 13)
            return 'Sabado'

        return 
    }

    // /**
    //  * Exibe uma mensagem com as informações sobre a pagina 
    //  * @param title Titulo da mensagem 
    //  * @param message Mensagem a ser Exebido
    //  * @param type 
    //  * @param callback 
    //  */
    // public  showInfoMessage(title: string, message: string, type: string, callback):void {
    //     this.alertCtrl.create({
    //         title: title,
    //         message: message,
    //         cssClass: type,
    //         buttons: [
    //             {
    //                 text: 'OK',
    //                 cssClass: 'btn-ok',
    //                 handler: data => callback()
    //             }
    //         ]
    //     }).present();
    // }
}