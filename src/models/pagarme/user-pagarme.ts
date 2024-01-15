export class UserPagarmeModel {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthday: string;
    cpf: string;

    constructor() { }

    static getPhone(phone: string) {
        return phone.startsWith('+55') ? phone : ('+55' + phone);
    }

    static fromUserModel(user) {
        let comprador = new UserPagarmeModel();
        comprador.id = user.id;
        comprador.name = user.name;
        comprador.email = user.email;
        comprador.phone = user.phone ? UserPagarmeModel.getPhone(user.phone) : "";
        comprador.cpf = user.cpf;

        return comprador;
    }
}