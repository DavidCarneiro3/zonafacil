export class DateUtil {

  public static formatDate(date: string): string {
    let dateRoute: string = date.substring(0, date.indexOf('_'));
    dateRoute = dateRoute.replace('-', '.').replace('-', '.');

    let year = dateRoute.substring(0, 4);
    let month = dateRoute.substring(5, 6);
    let day = dateRoute.substring(7, 8);

    return day + "." + month + "." + year;
  }

  public static formatHour(date: string): string {
    let hourRoute: string = date.substring(date.indexOf('_') + 1, date.length);
    return hourRoute.replace('-', ':').replace('-', ':').substring(0, 5);
  }

  public static formatDateWithHour(date: string): string {
    return this.formatDate(date) + " " + this.formatHour(date);
  }

  public static formatDateForID(date: Date) {
    let day, month, year, hours, minutes, seconds;

    if (date.getMonth() < 9) {
      month = "0" + (date.getMonth() + 1);
    } else {
      month = "" + (date.getMonth() + 1);
    }

    if (date.getDate() < 10) {
      day = "0" + date.getDate();
    } else {
      day = date.getDate();
    }

    if (date.getHours() < 10) {
      hours = "0" + date.getHours();
    } else {
      hours = date.getHours();
    }

    if (date.getMinutes() < 10) {
      minutes = "0" + date.getMinutes();
    } else {
      minutes = date.getMinutes();
    }

    if (date.getSeconds() < 10) {
      seconds = "0" + date.getSeconds();
    } else {
      seconds = date.getSeconds();
    }

    year = date.getFullYear();

    return day + "" + month + "" + year + "_" + hours + "" + minutes + "" + seconds;
  }

  static convertDate(isoDateStr: string) {
    // 2018-06-22T11:11:54
    let split = isoDateStr.split('T');
    let dateStr = split[0];
    let hourStr = split[1];

    let dateArr = dateStr.split('-');
    let hourArr = hourStr.split(':');

    let dt = new Date();
    dt.setFullYear(parseInt(dateArr[0]));
    dt.setMonth(parseInt(dateArr[1]) - 1);
    dt.setDate(parseInt(dateArr[2]));
    dt.setHours(parseInt(hourArr[0]));
    dt.setMinutes(parseInt(hourArr[1]));
    dt.setSeconds(parseInt(hourArr[2]));

    return dt;
  }

  /**
   * Pega a Data atual e formata YY-MM-DDTHH:MM:SS
   * Usado nas simulações da AMC
   */
  static getCurrenteDateFormated(): string {
    let currentDate = new Date().toISOString().slice(0, 10)
    let currentTime = new Date().toLocaleTimeString()
    return currentDate + 'T' + currentTime
  }

  /**
   * Gera um número único para utilização no ID da Transação
   * https://stackoverflow.com/questions/16176757/generate-unique-id-with-javascript-not-exceeding-an-integer
   */
  static uniqueID() {
    const timeinmilis = new Date().getTime();
    const unique = timeinmilis & 0xffffffff;
    return unique < 0 ? (unique * -1) : unique;
  }

}
