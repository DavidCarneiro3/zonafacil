// import { DateUtil } from "../../util/date.util";

export class Address{
	Streat: string
	Number: string
	Complement: string
	ZipCode: string
	District: string
	City: string
	State: string
	Country: string

	constructor(){
		this.Country = 'BRA'
	}

}

export class Payment{
	Type: string
	Amount: number
	Provider: string
	Address: string
	Assignor: string
	Demonstrative: string
	ExpirationDate: string
	Identification: string
	Instructions: string

	constructor(){
		this.Type = "Boleto"
		this.Instructions = "Qualquer instrução"
		this.Identification = '11884926754'
		this.Demonstrative = 'Demonstrative'
	}
}