export default class Weather {
    constructor() {
        this.json = 0;
    }

    async getInfo(place, lang, temp) {
        const responce = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&lang=${lang}&units=${temp}&APPID=e1e17f3a37078e2e3cae1a4082e20e57`);
        this.json = await responce.json();
        return this.json;
    }

    getTemp(day = 0) {
        return this.json.list[day].main.temp;
    }

    getState() {
        // for (let a in this.json.list[0].weather[0]) {
        //     alert(a)
        // }
        return this.json.list[0].weather[0].description.toUpperCase();
    }

    getFeelslike() {
        return this.json.list[0].main.feels_like;
    }

    getHumidity() {
        return this.json.list[0].main.humidity;
    }

    getWind() {
        return this.json.list[0].wind.speed;
    }

    getTimestamp() {
        return this.json.list[0].dt * 1000;
    }

    getIcon(day = 0, size = 4) {
        return `http://openweathermap.org/img/wn/${this.json.list[day].weather[0].icon}@${size}x.png`;
    }
}