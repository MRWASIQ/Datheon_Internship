
var apiKey = "b2e4f46dda89b9db124e50f030aad498";

var cityInput = document.getElementById("cityInput");
var searchButton = document.getElementById("searchButton");
var message = document.getElementById("message");

var cityName = document.getElementById("cityName");
var dateElement = document.getElementById("date");
var temperature = document.getElementById("temperature");
var weatherCondition = document.getElementById("weatherCondition");
var weatherIcon = document.getElementById("weatherIcon");

var humidity = document.getElementById("humidity");
var windSpeed = document.getElementById("windSpeed");
var pressure = document.getElementById("pressure");

var forecastContainer = document.getElementById("forecastContainer");

searchButton.addEventListener("click", function () {
    var city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

async function getWeather(city) {

    if (
        apiKey === "" ||
        apiKey === "YOUR_API_KEY" ||
        apiKey === "PASTE_YOUR_NEW_API_KEY_HERE"
    ) {
        message.textContent = "Please add a valid API key.";
        return;
    }

    message.textContent = "Loading weather data...";
    searchButton.disabled = true;

    try {

        var currentUrl =
            "https://api.openweathermap.org/data/2.5/weather?q="
            + encodeURIComponent(city)
            + "&appid=" + apiKey
            + "&units=metric";

        var forecastUrl =
            "https://api.openweathermap.org/data/2.5/forecast?q="
            + encodeURIComponent(city)
            + "&appid=" + apiKey
            + "&units=metric";

        var currentResponse = await fetch(currentUrl);
        var currentData = await currentResponse.json();

        if (!currentResponse.ok) {

            if (currentResponse.status === 404) {
                throw new Error("City not found. Please enter a correct city name.");
            }

            if (currentResponse.status === 401) {
                throw new Error("Invalid API key. Check your OpenWeatherMap API key.");
            }

            if (currentResponse.status === 429) {
                throw new Error("Too many requests. Please try again later.");
            }

            throw new Error(
                currentData.message || "Unable to get weather information."
            );
        }

        var forecastResponse = await fetch(forecastUrl);
        var forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {

            if (forecastResponse.status === 401) {
                throw new Error("API key authentication failed.");
            }

            throw new Error(
                forecastData.message || "Unable to load forecast data."
            );
        }

        showCurrentWeather(currentData);
        showForecast(forecastData);

        message.textContent = "";

    }
    catch (error) {

        message.textContent = error.message;

        forecastContainer.innerHTML =
            "<p>Forecast data is not available.</p>";

    }
    finally {

        searchButton.disabled = false;

    }
}

function showCurrentWeather(data) {

    cityName.textContent =
        data.name + ", " + data.sys.country;

    dateElement.textContent = new Date().toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    temperature.textContent =
        Math.round(data.main.temp) + "°C";

    weatherCondition.textContent =
        data.weather[0].description;

    weatherIcon.src =
        "https://openweathermap.org/img/wn/"
        + data.weather[0].icon + "@2x.png";

    weatherIcon.alt = data.weather[0].description;

    humidity.textContent =
        data.main.humidity + "%";

    windSpeed.textContent =
        data.wind.speed + " m/s";

    pressure.textContent =
        data.main.pressure + " hPa";

    changeBackground(data.weather[0].main);
}

function showForecast(data) {

    forecastContainer.innerHTML = "";

    var dailyForecast = {};

    data.list.forEach(function (item) {

        var day = item.dt_txt.split(" ")[0];

        if (!dailyForecast[day]) {
            dailyForecast[day] = item;
        }

        if (item.dt_txt.includes("12:00:00")) {
            dailyForecast[day] = item;
        }

    });

    var days = Object.values(dailyForecast).slice(0, 5);

    days.forEach(function (item) {

        var date = new Date(item.dt * 1000);

        var dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        var card = document.createElement("div");
        card.className = "forecast-card";

        var heading = document.createElement("h3");
        heading.textContent = dayName;

        var icon = document.createElement("img");

        icon.src =
            "https://openweathermap.org/img/wn/"
            + item.weather[0].icon + "@2x.png";

        icon.alt = item.weather[0].description;

        var temp = document.createElement("p");

        temp.textContent =
            Math.round(item.main.temp) + "°C";

        var condition = document.createElement("p");

        condition.textContent =
            item.weather[0].description;

        card.appendChild(heading);
        card.appendChild(icon);
        card.appendChild(temp);
        card.appendChild(condition);

        forecastContainer.appendChild(card);

    });
}

function changeBackground(condition) {

    document.body.className = "";

    if (condition === "Clear") {

        document.body.classList.add("sunny");

    }
    else if (condition === "Clouds") {

        document.body.classList.add("cloudy");

    }
    else if (
        condition === "Rain" ||
        condition === "Drizzle" ||
        condition === "Thunderstorm"
    ) {

        document.body.classList.add("rainy");

    }
    else if (condition === "Snow") {

        document.body.classList.add("snowy");

    }

}
