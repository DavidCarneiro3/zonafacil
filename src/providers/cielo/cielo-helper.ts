export class CieloHelper{

	public static types = {
		
	}

	getBrand(number){
		
		if(number){
			if(number[0] == "4"){
				return "Visa"
			}else if(number[0] == "3"){
				if(number[1] == "4" || number[1] == "7"){
					return "Amex"
				}
				else if(number[1] == "8"){
					return "Hipercard"
				}
			}else if(number[0] == "5"){
				if(number[1] == "1" || number[1] == "2" || number[1] == "3" || number[1] == "4" || number[1] == "5"){
					return "Master"
				}
			}else if(number.substring(0, 1) == "60"){
				return "Hipercard"
			}else if(number.substring(0, 3) == "6011" || number.substring(0, 2) == "622" || number.substring(0, 1) == "64" || number.substring(0, 1) == "65"){
				return "Discover"
			}else if(number.substring(0, 3) == "2221" || number.substring(0, 3) == "2720"){
				return "Master"
			}
			else{
				return undefined;
			}
			
		}else{
			return undefined
		}
	}

	getDateFormat(date: any){
		let _date = new Date(date);
		let month = _date.getMonth() + 1;
		let year = _date.getFullYear();
		if(month < 10){
			return "0" + month.toString() + '/' + year.toString()
		}else{
			return month.toString() + '/' + year.toString()
		}

	}

	getBoletoExpirationDate(){
		let date = new Date();
		date.setDate(date.getDate() + 3)

		return date.getDate().toString() + '/' + (date.getMonth() + 1).toString() + '/' + date.getFullYear().toString();
	}

	getAmount(val){
		return val * 100;
	}
}