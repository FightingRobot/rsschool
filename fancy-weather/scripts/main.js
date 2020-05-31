import IpinfoAPI from './IpinfoAPI.js';
import Geocode from './GeocodingAPI.js';
import Clock from './Clock.js';
import Weather from './WeatherAPI.js';
import Unsplash from './UnsplashAPI.js';
import EnglishLang from './translation.js';
import selectors from './Selectors.js';

const latitude = document.querySelector('.latitude');
const longitude = document.querySelector('.longitude');
const placeSelector = document.querySelector('.temp-info__country');
const timeSelector = document.querySelector('#time');

const searchFormSend = document.querySelector('.search-form__send');
const searchFormInput = document.querySelector('.search-form__input');
const refreshButton = document.querySelector('.btn__pic');

const tempNow = document.querySelector('.temp-info__temp-now');
const state = document.querySelector('#state');
const tempImgNow = document.querySelector('.temp-info__img-now');
const feelsLikeNow = document.querySelector('.temp-info__feels-like_now');
const windNow = document.querySelector('.temp-info__wind-speed_now');
const humidityNow = document.querySelector('.temp-info__humidity_now');

const tempDays = document.querySelectorAll('.temp-info__temp');
const iconDays = document.querySelectorAll('.temp-info__img');

class Controller {

  constructor() {
    this.ipinfoAPI = new IpinfoAPI();
    this.geocode = new Geocode();
    this.clock = new Clock();
    this.weather = new Weather();
    this.unsplash = new Unsplash();
    this.englishLang = new EnglishLang();
    this.selectors = selectors;

    this.searchValue = 0;
    this.picNum = 0;
  }

  async makeGetInfoRequest() {
    await this.ipinfoAPI.getInfo();
    this.ipinfoAPI.getCity();
    this.searchValue = this.ipinfoAPI.city;
  }

  async makeGeocodeRequest() {
    await this.geocode.getInfo(this.searchValue, 'en');
  }

  setCoords() {
    this.geocode.updateCoords(latitude, longitude);
  };

  async setPlace() {
    placeSelector.innerHTML = await this.geocode.getFormattedPlace();
  };

  setWeekDay(date) {
    const days = this.englishLang.days;
    const day = date.getDay();
    const dayMonth = date.getDate();

    for (let i = 0; i < 4; i += 1) {
      this.selectors[`day${i + day}`].innerHTML = days[i + day].toUpperCase();

      if (i === 0) {
        this.selectors[`day${i + day}`].innerHTML = days[i + day].slice(0, 3);
        this.selectors.dayMonth.innerHTML = dayMonth;
      }
    }
  }

  setMonth(date) {
    const months = this.englishLang.months;
    const month = date.getMonth();

    this.selectors.month.innerHTML = months[month];
  }

  setDate() {
    const timestamp = this.geocode.getTimestamp();
    const date = new Date(timestamp);

    this.setWeekDay(date);
    this.setMonth(date);

    this.clock.date = date;
    this.clock.startTimer(timeSelector);
    return timestamp;
  };

  async makeWeatherRequest() {
    await this.weather.getInfo(this.searchValue, 'en');
  }

  setTodayWeather() {
    state.innerHTML = `${this.weather.getState()}`;
    tempNow.innerHTML = `${Math.round(this.weather.getTemp())}`;
    feelsLikeNow.innerHTML = `${this.weather.getFeelslike()}&deg;`;
    windNow.innerHTML = `${this.weather.getWind()} m/s`;
    humidityNow.innerHTML = `${this.weather.getHumidity()}%`;
    tempImgNow.src = this.weather.getIcon();
  }

  setOtherWeather() {
    for (let i = 0; i < 3; i++) {
      tempDays[i].innerHTML = `${Math.round(this.weather.getTemp(i + 1))}&deg;`;
      iconDays[i].src = this.weather.getIcon(i + 1, 2);
    }
  }

  createMap(center) {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.geocode.getCoords().reverse(),
      zoom: 8,
      accessToken: 'pk.eyJ1IjoiYXphbWF0LXR1cmJvIiwiYSI6ImNrYXNqYm1wajBrMmkzMW1zM3psYjk5cHEifQ.6BZ2fiSMJylkScQ-R_609w'
    });

    const marker = new mapboxgl.Marker()
      .setLngLat(this.geocode.getCoords().reverse())
      .addTo(map);
  }

  async makeUnsplashRequest() {
    this.picNum = 0;
    await this.unsplash.getInfo(this.searchValue);
  }

  setBackground() {
    document.body.style.backgroundImage = `url(${this.unsplash.getPicture(this.picNum)})`;
  }

  changeBackground() {
    this.picNum += 1;
    this.setBackground();
  }

  async start(place = 'UserLocation') {


    // try {
    //   let results = await Promise.all([
    //     await this.makeGeocodeRequest(),
    //     await this.makeWeatherRequest(),
    //     await this.setCoords(),
    //     await this.setPlace(),
    //     await this.setDate(),
    //     await this.setTodayWeather(),
    //     await this.setOtherWeather(),
    //     await this.createMap(),
    //   ]);
    // } catch {
    //   alert('MISTAKE');
    // }
    if (place === 'UserLocation') {
      await this.makeGetInfoRequest();
    }

    await this.makeGeocodeRequest();
    await this.setCoords();
    await this.setPlace();

    await this.makeWeatherRequest()
    this.setTodayWeather();
    this.setOtherWeather();

    this.setDate();

    this.createMap();

    // await this.makeUnsplashRequest();
    // await this.setBackground();
  }

  async findPlace() {
    event.preventDefault();
    this.searchValue = searchFormInput.value;
    await this.start(this.searchValue);
  }
}

let controller = new Controller();

// async function allSystemsActivate() {
//   await controller.makeGetInfoRequest();

//   await controller.makeGeocodeRequest();
//   await controller.setCoords();
//   await controller.setPlace();

//   await controller.makeWeatherRequest()
//   controller.setTodayWeather();
//   controller.setOtherWeather();

//   await controller.setDate();

//   controller.createMap();
// }

controller.start();


searchFormSend.onclick = controller.findPlace.bind(controller);
refreshButton.onclick = controller.changeBackground.bind(controller);