// API URLs
var periodRatesURL = 'https://api.exchangeratesapi.io/history?';
var latestRatesURL = 'https://api.exchangeratesapi.io/latest?base=PLN';

// DOM elements
var currencyList = document.querySelector('.currency-list');
var historicalRatesList = document.querySelector('.historical-rates-list');
var currencyAppDiv = document.querySelector('.currency-app');
var scrollDiv = document.querySelector('.scroll');

// Media Queries
var mediaQuery = window.matchMedia('(max-width: 567px)');

// State
var state = {
    periodRates: [],
    clickedElementID: '',
    todaysDate: '',
    lastMondaysDate: ''
}

// Functions for getting desired Date
var now = new Date();

function getDate(date) {
    var day = '';
    if (date.getDate() < 10) {
        day = "0" + date.getDate();
    } else day = date.getDate();

    return (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + day);
}

function getMonday(now) {
    date = new Date(now);
    var day = date.getDay();
    var diff = date.getDate() - day + (day == 0 ? -6 : 1) - 7;
    var lastMonday = new Date(date.setDate(diff));
    return getDate(lastMonday);
}

state.todaysDate = getDate(now);
state.lastMondaysDate = getMonday(state.todaysDate);

// Fetch data on page load
window.onload = getLatestRates;

function getLatestRates() {
    fetch(latestRatesURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var latestRatesData = data.rates;

            for (var [key, value] of Object.entries(latestRatesData)) {
                if (key !== "PLN") {
                    renderCurrencyList(key, value);
                }
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}


// Render Currency List on left side of page
var renderCurrencyList = function (key, value) {
    var markup = `
    <div class="rate">
    <p class="rate-data" id=${key}><span class="currency-span">Currency: ${key}</span> 
    Rate: <span class="rate-value-span">${value}</span></p>
    <img src="./img/${key}.png" alt=""/>
    </div>
    `;

    currencyList.insertAdjacentHTML('beforeend', markup);
}

// On currency click handler 
currencyList.addEventListener("click", function (e) {
    var rateDivs = document.querySelectorAll('.rate');
    rateDivs.forEach(el => {
        el.classList.remove('clicked')
    })

    if (e.target.id !== 'currency') {
        state.clickedElementID = e.target.closest('.rate').firstElementChild.id;
        e.target.closest('.rate').classList.add('clicked');
        getPeriodRates();
    } else {
        state.clickedElementID = '';
    }

    if (mediaQuery.matches) {
        currencyAppDiv.scroll({
            top: currencyAppDiv.scrollHeight,
            behavior: 'smooth'
        });

    } else {
        currencyAppDiv.scroll({
            top: 0,
            behavior: 'smooth'
        });
    }

})

// Compare function for sorting historical rates
function compare(a, b) {
    if (a.date > b.date) return 1;
    else if (a.date < b.date) return -1;
    else return 0;
}

// Fetch historical rates 
function getPeriodRates() {
    fetch(`https://api.exchangeratesapi.io/history?start_at=${state.lastMondaysDate}&end_at=${state.todaysDate}&symbols=${state.clickedElementID}&base=PLN`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var periodRatesData = data.rates;

            for (date in periodRatesData) {
                var rateObj = periodRatesData[date]
                for (raiting in rateObj) {
                    var rate = rateObj[raiting];
                    state.periodRates.push({
                        date,
                        rate
                    });
                }
            }
            state.periodRates.sort(compare);

            renderHistoricalRatesList(state.periodRates);
        })
        .catch(function (err) {
            console.log(err);
        })
}

// Render Historical Rates on right side of page
function renderHistoricalRatesList(data) {

    historicalRatesList.innerHTML = '';

    var markup = `
    <div class="historical-rate" >
    <h2>Rate for: ${state.clickedElementID} <img src="./img/${state.clickedElementID}.png"></h2>
    <p class="date">From ${state.lastMondaysDate} to ${state.todaysDate}</p>
    <table class="table table-hover">
    <thead>
      <tr>
        <th scope="col">DAY</th>
        <th scope="col">DATE</th>
        <th scope="col">RATE</th>
      </tr>
    </thead>
    <tbody class="table-body">
    </tbody>
    </table>
    </div>`;

    historicalRatesList.insertAdjacentHTML('beforeend', markup);
    var tableBody = document.querySelector('.table-body');

    data.forEach(function (el, index) {
        var markup = `
        <tr>
          <th scope="row">${index+1}</th>
          <td>${el.date}</td>
          <td>${el.rate}</td>
        </tr>
          `
        tableBody.insertAdjacentHTML('beforeend', markup);
    });

    state.periodRates = [];
};

// Scroll handler for Currency App
currencyAppDiv.addEventListener('scroll', function () {
    if (this.scrollTop > 2400) {
        scrollDiv.style.display = "none"
    } else {
        scrollDiv.style.display = "block"
    }
});