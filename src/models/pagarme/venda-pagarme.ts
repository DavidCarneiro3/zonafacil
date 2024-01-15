export class VendaPagarmeModel {
    id: string;
    name: string;
    price: number;
    qtd: number = 1;
    category: string = '';
    date: string = '';

    constructor() { }

    static validateCardNumber(card_number: string): boolean {
        let regex = new RegExp("^[0-9]{16}$");
        if (!regex.test(card_number))
            return false;

        return this.luhnCheck(card_number);
    }

    /**
     * Luhn algorithm in JavaScript: validate credit card number supplied as string of numbers
     * @author ShirtlessKirk. Copyright (c) 2012.
     * @license WTFPL (http://www.wtfpl.net/txt/copying)
     */
    static luhnCheck(val: string) {
        let sum = 0;
        for (let i = 0; i < val.length; i++) {
            let intVal = parseInt(val.substr(i, 1));
            if (i % 2 == 0) {
                intVal *= 2;
                if (intVal > 9) {
                    intVal = 1 + (intVal % 10);
                }
            }
            sum += intVal;
        }
        return (sum % 10) === 0;
    }
}