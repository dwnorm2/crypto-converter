/* 
  The event listeners perform crypto amount conversions when the Convert button 
  is clicked or when the user presses enter.
*/
document.querySelector("button").addEventListener("click", changeAmount);

let input = document.querySelector("#amount"); // Amount of coin 1 to convert

input.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    changeAmount();
    // Cancel the default action, if needed
    event.preventDefault();
  }
});

// Array of selectors for input fields of coins 1 and 2
let coins = [
  document.querySelector("#currency1"),
  document.querySelector("#currency2"),
];

/* Loop through array of selectors (above) for coins and add an event listener
   for the 'keypress' action which updates the letiables storing coin names. */
for (let i = 0; i < coins.length; i++) {
  coins[i].addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      changeCoins();
      event.preventDefault();
    }
  });
}

// TODO: Start class definition

// TODO: letiables will be properties and part of constructor function
// Amount of crypto to be converted
let amount = 0;
let coin1 = "",
  coin2 = "",
  tickers = [];

let coinPrice1 = 0;
let coinPrice2 = 0;
let convertedNumber = 0;

// TODO: Functions will be methods in class
/* 
  changeAmount updates the amount of crypto to be converted by getting the  
  new value from input then performs a conversion 
*/
function changeAmount() {
  amount = Number(document.querySelector("#amount").value);
  changeCoins();
  convert();
}

/*  changeCoins resets tickers to an empty array and updates the names of 
    coins 1 & 2 */
function changeCoins() {
  tickers = [];
  coin1 = coins[0].value;
  coin2 = coins[1].value;
}

/*  searchCoin takes a string representing a coin name and formats the string 
    then fetches info from the CoinCap API. The function stores the ticker 
    symbol and returns the current coin price in USD */
async function searchCoin(coin) {
  try {
    let name = coin.toLowerCase();
    if (name.includes(" ")) name = name.split(" ").join("-");

    const response = await fetch(
      `https://api.coincap.io/v2/assets?search=${name}`
    );
    const data = await response.json();
    if (data.data) {
      if (coin !== "") tickers.push(data.data[0].symbol);
      return data.data[0].priceUsd;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

/*  convert calculates the exchange rate between coin 1 and coin 2 given the 
    amount of coin 1 to be converted */
async function convert() {
  coinPrice1 = await searchCoin(coin1);
  coinPrice2 = await searchCoin(coin2);
  convertedNumber = (amount * coinPrice1) / coinPrice2; // exchange rate
  updateUI(convertedNumber.toFixed(convertedNumber > 1 ? 2 : 4));
}

/*  updateUI provides an updated display of the conversion rate between the
    two coins provided */
function updateUI(convertedNumber) {
  if (tickers.length !== 0) {
    document.getElementById(
      "conversionMessage"
    ).textContent = `${amount} ${tickers[0].toUpperCase()} = ${
      convertedNumber > 0 ? convertedNumber : 0
    } ${tickers[1].toUpperCase()}`;
  }

  // let ticker = data.symbol;
  // document.getElementById(
  //   "logo"
  // ).src = `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`;
}

//get asset data

function getAssets() {
  fetch(`https://api.coincap.io/v2/assets`)
    .then((red) => red.json())
    .then((data) => {
      populateDropdowns(data.data);
    })
    .catch((err) => {
      console.log(`error ${err}`);
    });
}

// Dropdown functionality
function initializeDropdown(dropdown) {
  let input = dropdown.querySelector("input");
  let content = dropdown.querySelector(".dropdown-content");
  let options = content.querySelectorAll("a");

  input.addEventListener("input", function () {
    let searchValue = input.value.toUpperCase();
    options.forEach(function (option) {
      let optionValue = option.getAttribute("data-value").toUpperCase();
      if (optionValue.indexOf(searchValue) > -1) {
        option.style.display = "";
      } else {
        option.style.display = "none";
      }
    });
  });

  input.addEventListener("click", function () {
    content.style.display = "block";
  });

  document.addEventListener("click", function (event) {
    if (!dropdown.contains(event.target)) {
      content.style.display = "none";
    }
  });

  options.forEach(function (option) {
    option.addEventListener("click", function () {
      input.value = option.getAttribute("data-value");
      content.style.display = "none";
    });
  });
}

// Populate dropdowns
function populateDropdowns(data) {
  let dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach(function (dropdown) {
    let content = dropdown.querySelector(".dropdown-content");

    for (let i = 0; i < data.length; i++) {
      let option = document.createElement("a");
      option.href = "#";
      option.dataset.value = data[i].symbol;
      option.textContent = data[i].symbol;
      content.appendChild(option);
    }

    initializeDropdown(dropdown);
  });
}

getAssets();

// TODO: Enable swapping coin1 with coin2
