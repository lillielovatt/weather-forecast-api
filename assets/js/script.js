const cityStorageEl = document.querySelector(".recent-city");
const formEl = document.querySelector(".search-form");
const forecastTodayEl = document.querySelector(".forecast-today");
const forecast5DaysEl = document.querySelector(".forecast-5day");

const apiId = config.MY_API_TOKEN;
var recentCityStorage = [];

loadCities();



// takes cities recently searched and saved in local storage, loads them as buttons in class="storage-city"
function loadCities() {
    while (cityStorageEl.firstChild) {
        cityStorageEl.removeChild(cityStorageEl.lastChild);
    }
    if (localStorage.getItem("recent-city")) {
        for (let i = JSON.parse(localStorage.getItem("recent-city")).length - 1; i >= 0; i--) {
            var cityEl = document.createElement("li");
            cityEl.innerText = JSON.parse(localStorage.getItem("recent-city"))[i];
            cityStorageEl.appendChild(cityEl);
        }
    }
    // make the li item a clickable element, that when you click it, it calls function
}

function getCity(event) {
    // stops from refreshing upon submit botton being clicked
    event.preventDefault();

    // saves city value from user input, sends it to outside function to correct case of letters, and then clears the form
    var cityInput = document.querySelector("input[name='city']").value;
    cityInput = correctCaseCityName(cityInput);
    document.querySelector("input[name='city']").value = "";

    // clear forecast, current and future, to repopulate based on call below
    while (forecastTodayEl.firstChild || forecast5DaysEl.firstChild) {
        if (forecastTodayEl.firstChild) {
            forecastTodayEl.removeChild(forecastTodayEl.lastChild);
        }
        forecast5DaysEl.removeChild(forecast5DaysEl.lastChild);
    }

    // craft API URL with the city input, and with API key from OpenWeather
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + apiId;
    fetch(apiUrl).then(function (response) {
        if (response.ok) { //if there's no error thrown from this call to the API
            response.json().then(function (data) {
                getForecast(data.coord.lat, data.coord.lon, cityInput);
            })
        } else {
            // display that the city does not exist. It could be another error, but we will assume this is the issue as of now.
            forecastTodayEl.innerHTML = `
            <h2>Sorry, that city doesn't exist. Try another!</h2>
            `
        }
    });
}

// if you type in "san diego" or "portland", it automatically adjusts to corrected "San Diego" or "Portland"
function correctCaseCityName(cityStr) {
    cityStr = cityStr.toLowerCase();
    var myCityArray = cityStr.split(" ");
    if (myCityArray.length === 1) {
        cityStr = cityStr[0].toUpperCase() + cityStr.substring(1);
        return cityStr;
    } else {
        var cityStrCorrect = "";
        for (let i = 0; i < myCityArray.length; i++) {
            myCityArray[i] = myCityArray[i][0].toUpperCase() + myCityArray[i].substr(1);
            cityStrCorrect += myCityArray[i] + " ";
        }
        return cityStrCorrect.trim();
    }
}

// using lat and lon, extracts info from API call INCLUDING: an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
function getForecast(lat, lon, city) {
    // takes the long and lat from the previous function, which had a city as an input, to make another, more specific API call
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiId;

    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                // create an object that extracts all necessary info from data returned from API call
                var weatherCurrentObj = {
                    temp: data.current.temp,
                    humidity: data.current.humidity,
                    windSpeed: data.current.wind_speed,
                    cityName: city,
                    uvIndex: data.current.uvi,
                    icon: data.current.weather[0].icon
                };
                // use function to display ^ info thru HTML dynamically on screen
                fillCurrentForecast(weatherCurrentObj);
                // slice the daily weather forecast to omit the 0th index (today), and only keep the following 5 days
                var daily = data.daily.slice(1, 6);
                // go through each day, starting with 0 (tomorrow), and call function to display info with cards thru HTML
                for (let i = 0; i < daily.length; i++) {
                    var weather5DayObj = {
                        temp: daily[i].temp.day,
                        humidity: daily[i].humidity,
                        windSpeed: data.daily[i].wind_speed,
                        icon: data.daily[i].weather[0].icon,
                        day: i //allows us to track which day this is; when we call the function below, var i won't be accessible
                    };
                    fill5DayForecast(weather5DayObj);
                }
                setStorage(city);
                loadCities();
            })
        }
        else {
            forecastTodayEl.innerHTML = `
            <h2>Sorry, something went wrong. Try again!</h2>
            `
        }
    });

}

// takes all info (temp, humidity, windSpeed, cityName, uvIndex, icon) and dynamically displays current forecast on page using HTML
function fillCurrentForecast(weatherObj) {
    // obj destructuring
    const { temp, humidity, windSpeed, cityName, uvIndex, icon } = weatherObj;
    // get today's date
    var date = moment().format("dddd MMMM DD, YYYY")

    //using template literals, we can add HTML much easier than declaring and appending each element, using ${} and assigned variables
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

    // selects the UV index value, which is within its own span element, allowing us to change the background color of it individually
    var uvIndexEl = document.querySelector(".uv-index");
    if (uvIndex <= 2) {
        uvIndexEl.style.backgroundColor = "#00ff00";
    } else if (2 < uvIndex <= 6) {
        uvIndexEl.style.backgroundColor = "#ffff00";
    } else if (6 < uvIndex <= 8) {
        uvIndexEl.style.backgroundColor = "#ffa500";
    } else if (8 < uvIndex <= 11) {
        uvIndexEl.style.backgroundColor = "#ff0000";
    } else if (uvIndex > 11) {
        uvIndexEl.style.backgroundColor = "#dda0dd";
    }
}

// takes all info (temp, humidity, windSpeed, cityName, icon, day) and dynamically displays 5 day forecast on page using HTML
function fill5DayForecast(weatherObj) {
    // obj destructuring
    const { temp, humidity, windSpeed, cityName, icon, day } = weatherObj;

    // get today's date, then add var "day" days + 1 (where here, day is var i from our for loop, passed into this function as var day)
    var date = moment().add(day + 1, "d").format("MMMM DD");

    //using template literals, we can add HTML much easier than declaring and appending each element, using ${} and assigned variables
    forecast5DaysEl.innerHTML += `
        <div class="col-md-2 five-day">
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
}

function setStorage(city) {
    recentCityStorage = JSON.parse(localStorage.getItem("recent-city")) || [];
    if (!localStorage.getItem("recent-city")) {
        localStorage.setItem("recent-city", recentCityStorage);
    };
    recentCityStorage.push(city);
    localStorage.setItem("recent-city", JSON.stringify(recentCityStorage));

    // if storage gets bigger than 7 cities, then delete the last one--WHICH IS THE FIRST ONE IN THE LIST.
    if (JSON.parse(localStorage.getItem("recent-city")).length > 8) {
        recentCityStorage.shift();
        localStorage.setItem("recent-city", JSON.stringify(recentCityStorage));
    }


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