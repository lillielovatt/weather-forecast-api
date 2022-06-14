const cityStorageEl = document.querySelector(".recent-city");
const formEl = document.querySelector(".search-form");
const forecastTodayEl = document.querySelector(".forecast-today");
const forecast5DaysEl = document.querySelector(".forecast-5day");
const apiId = "674c74b15352c07021c43ba1b8d4139b"; //1eb784753dd9691347d2b905eeeffc69
var recentCityStorage = [];

loadCities();



// takes cities recently searched and saved in local storage, loads them as buttons in class="storage-city"

function loadCities() {
    // clears the history DIV, necessary when calling this function after a new search

    if (localStorage.getItem("recent-city")) {
        for (let i = 0; i < JSON.parse(localStorage.getItem("recent-city")).length; i++) {
            var cityEl = document.createElement("li");
            cityEl.innerText = JSON.parse(localStorage.getItem("recent-city"));
            cityStorageEl.appendChild(cityEl);
        }
    }
    // make the li item a clickable element, that when you click it, it calls function
}

function getCity(event) {
    event.preventDefault();

    var cityInput = document.querySelector("input[name='city']").value;
    document.querySelector("input[name='city']").value = "";

    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + apiId;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                getForecast(data.coord.lat, data.coord.lon, cityInput);
                // console.log(data.coord.lat);
                // console.log(data.coord.lon);
            })
        } else {
            // display in the cards that the city does not exist.
        }
    });


}


// the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
function getForecast(lat, lon, city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiId;

    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                var weatherCurrentObj = {
                    temp: data.current.temp,
                    humidity: data.current.humidity,
                    windSpeed: data.current.wind_speed,
                    cityName: city,
                    uvIndex: data.current.uvi,
                    icon: data.current.weather[0].icon
                }
                var weatherArray = [weatherCurrentObj];
                for (let i = 1; i < 6; i++) {
                    var weather5DayObj = {
                        temp: data.daily[i].temp.day,
                        humidity: data.daily[i].humidity,
                        windSpeed: data.daily[i].wind_speed,
                        cityName: city,
                        uvIndex: data.daily[i].uvi,
                        icon: data.daily[i].weather[0].icon
                    }
                    weatherArray.push(weather5DayObj);
                }

                // console.log(weatherArray);
                setStorage(city);
                loadCities();
                fillForecast(weatherArray);
            })
        }
    });

}

function fillForecast(weatherArray) {
    // fill in weatherArray[0] with today's forecast, class=forecast-today
    var cityDate = document.createElement("h2");
    cityDate.innerHTML = weatherArray[0].cityName + " " + moment().format("dddd MMMM DD, YYYY") + "<img src='http://openweathermap.org/img/w/" + weatherArray[0].icon + ".png ' alt='' />";
    forecastTodayEl.appendChild(cityDate);

    // fill in weather[1:5] with 5 day forecast, class=forecast-5day

    // http://openweathermap.org/img/w/04d.png icon, just replace "04d" with anything else 

    for (let i = 1; i < 6; i++) {
        var weatherNextDay = document.createElement("h3");
        weatherNextDay.innerHTML = moment().add(i, "d").format("dddd MMMM DD, YYYY") + "<img src='http://openweathermap.org/img/w/" + weatherArray[i].icon + ".png ' alt='' />";


    }

    // UV <= 2 green
    // 2 < UV <= 6 yellow
    // 6 < UV <= 8 orange
    // 8 < UV <= 11 red 
    // UV > 11 lavender
    // background colors
}

function setStorage(city) {
    recentCityStorage = JSON.parse(localStorage.getItem("highscore")) || [];
    if (!localStorage.getItem("recent-city")) {
        localStorage.setItem("recent-city", recentCityStorage);
    }
    recentCityStorage.push(city);
    localStorage.setItem("recent-city", JSON.stringify(recentCityStorage));

    // if storage gets bigger than 7 cities, then delete the last one--WHICH IS THE FIRST ONE IN THE LIST.
    // if city is already in the list, then delete previous place--bring to the end. 
}


formEl.addEventListener("submit", getCity);


// when you click the submit button, with a city, then it GETS the forecast

// need two kinds of functions maybe? the part with the fetch call, and the part where we fill in the HTML
// pass info thru with object

// emojis for weather?
// color for UV index?


// adds most recently searched city to the top of the list
// if local storage is greater than 7 cities, then push the last one out.

// how to deal with cities that have 2 of the same name??