const cityStorageEl = document.querySelector(".recent-city");
const formEl = document.querySelector(".search-form");
const forecastTodayEl = document.querySelector(".forecast-today");
const forecast5DaysEl = document.querySelector(".forecast-5day");
// const apiId = config.MY_API_TOKEN; //"674c74b15352c07021c43ba1b8d4139b"; 
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
                // var weatherArray = [weatherCurrentObj];
                fillCurrentForecast(weatherCurrentObj);

                var daily = data.daily.slice(1, 6);
                for (let i = 0; i < daily.length; i++) {
                    var weather5DayObj = {
                        temp: daily[i].temp.day,
                        humidity: daily[i].humidity,
                        windSpeed: data.daily[i].wind_speed,
                        // uvIndex: data.daily[i].uvi,
                        icon: data.daily[i].weather[0].icon,
                        day: i
                    }
                    // weatherArray.push(weather5DayObj);
                    fill5DayForecast(weather5DayObj);
                }

                // console.log(weatherArray);
                setStorage(city);
                loadCities();
                // fillForecast(weatherArray);
            })
        }
    });

}

function fillCurrentForecast(weatherObj) {
    // obj destructuring
    const { temp, humidity, windSpeed, cityName, uvIndex, icon } = weatherObj;

    var date = moment().format("dddd MMMM DD, YYYY")
    forecastTodayEl.innerHTML = `
        <div>
            <div>
                <div>
                    <h2>${cityName} - ${date} <img src="http://openweathermap.org/img/w/${icon}.png"/></h2>
                    <p>Temp: ${temp}&deg;F</p>
                    <p>Wind: ${windSpeed} MPH</p>
                    <p>Humidity: ${humidity}%</p>
                    <p>UV Index: <span class="uv-index"> ${uvIndex} </span></p>
                </div>
            </div>
        </div>
    `;
    // forecastTodayEl.appendChild(cityDate);
    var uvIndexEl = document.querySelector(".uv-index");
    if(uvIndex<=2){
        uvIndexEl.style.backgroundColor="#00ff00";
    } else if(2<uvIndex<=6){
        uvIndexEl.style.backgroundColor="#ffff00";
    }else if(6<uvIndex<=8){
        uvIndexEl.style.backgroundColor="#ffa500";
    }else if(8<uvIndex<=11){
        uvIndexEl.style.backgroundColor="#ff0000";
    }else if(uvIndex>11){
        uvIndexEl.style.backgroundColor="#dda0dd";
    }


    // UV <= 2 green
    // 2 < UV <= 6 yellow
    // 6 < UV <= 8 orange
    // 8 < UV <= 11 red 
    // UV > 11 lavender
    // background colors


    // cityDate.innerHTML = weatherArray[0].cityName + " - " + moment().format("dddd MMMM DD, YYYY") + "<img src='http://openweathermap.org/img/w/" + weatherArray[0].icon + ".png ' alt='' />";
    

}

function fill5DayForecast(weatherObj) {
    // obj destructuring
    const { temp, humidity, windSpeed, cityName, icon, day } = weatherObj;

    // // fill in weatherArray[0] with today's forecast, class=forecast-today
    // var cityDate = document.createElement("h2");
    // cityDate.innerHTML = weatherArray[0].cityName + " - " + moment().format("dddd MMMM DD, YYYY") + "<img src='http://openweathermap.org/img/w/" + weatherArray[0].icon + ".png ' alt='' />";
    // forecastTodayEl.appendChild(cityDate);

    // // fill in weather[1:5] with 5 day forecast, class=forecast-5day

    // // http://openweathermap.org/img/w/04d.png icon, just replace "04d" with anything else 


    var date = moment().add(day, "d").format("MMMM DD");
    //  + "<img src='http://openweathermap.org/img/w/" + weatherArray[i].icon + ".png ' alt='' />";
    // var weatherInfo = ""
    console.log(temp);
    forecast5DaysEl.innerHTML += `
        <div class="col-md-2 day${day}">
            <div class="card">
                <div class="card-body">
                    <h5>${date} <img src="http://openweathermap.org/img/w/${icon}.png"/></h5>
                    <p>Temp: ${temp} &deg;F</p>
                    <p>Wind: ${windSpeed} MPH</p>
                    <p>Humidity: ${humidity}%</p>
                </div>
            </div>
        </div>
        `;
    // forecast5DaysEl.innerHTML += '<div class="col-md-2 day' + i + '">            <div class="card">                <div class="card-body">                    <h5>' + date + '<img src="http://openweathermap.org/img/w/' + weatherArray[i].icon + '.png" alt=""/> </h5>                    <p class="' + weatherInfo + '"></p>                </div>        </div >    </div > ';

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

// created this fix city input case but turns out I can just get it from the call itself
// if you type in "san diego" or "portland", it automatically adjusts to corrected "San Diego" or "Portland"
// function correctCaseCityName(cityStr) {
//     cityStr = cityStr.toLowerCase();
//     var myCityArray = cityStr.split(" ");
//     if (myCityArray.length === 1) {
//         cityStr = cityStr[0].toUpperCase() + cityStr.substring(1);
//         return cityStr;
//     } else {
//         var cityStrCorrect = "";
//         for (let i = 0; i < myCityArray.length; i++) {
//             myCityArray[i] = myCityArray[i][0].toUpperCase() + myCityArray[i].substr(1);
//             cityStrCorrect += myCityArray[i] + " ";
//         }
//         return cityStrCorrect.trim();
//     }
// }