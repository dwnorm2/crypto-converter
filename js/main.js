class Converter {
  constructor() {
    // Properties
    this.amount = 0;
    (this.coin1 = ""), (this.coin2 = ""), (this.tickers = []);

    this.coinPrice1 = 0;
    this.coinPrice2 = 0;
    this.convertedNumber = 0;

    // Harcoded fiat currencies
    this.fiats = [
      "united-states-dollar",
      "euro",
      "japanese-yen",
      "british-pound-sterling",
      "canadian-dollar",
      "australian-dollar",
      "chinese-yuan-renminbi",
    ];
    this.fiat = []; // For data from rates endpoint
    this.coins = []; // For data from assets endpoint
    this.data = []; // For both coin and fiat data
    this.prices = {}; // For fiat prices in USD
  }

  // Class Methods

  /* 
    changeAmount updates the amount of crypto to be converted by getting the  
    new value from input then performs a conversion 
  */
  changeAmount() {
    this.amount = Number(document.querySelector("#amount").value);
    this.changeCoins();
    this.convert();
  }

  /*  changeCoins resets tickers to an empty array and updates the names of 
      coins 1 & 2 */
  changeCoins() {
    this.tickers = [];
    this.coin1 = coins[0].value;
    this.coin2 = coins[1].value;
  }

  /*  searchCoin takes a string representing a coin name and formats the string 
      then fetches info from the CoinCap API. The function stores the ticker 
      symbol and returns the current coin price in USD */
  async searchCoin(coin) {
    let fiatSymbols = Object.keys(this.prices);

    // Check fiatSymbols to see if coin is fiat
    if (fiatSymbols.includes(coin)) {
      this.tickers.push(coin);
      return this.prices[coin];
    }

    try {
      let name = coin.toLowerCase();
      if (name.includes(" ")) name = name.split(" ").join("-");

      const response = await fetch(
        `https://api.coincap.io/v2/assets?search=${name}`
      );
      const data = await response.json();
      if (data.data) {
        if (coin !== "") this.tickers.push(data.data[0].symbol);
        return data.data[0].priceUsd;
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  /*  convert calculates the exchange rate between coin 1 and coin 2 given the 
      amount of coin 1 to be converted */
  async convert() {
    this.coinPrice1 = await this.searchCoin(this.coin1);
    this.coinPrice2 = await this.searchCoin(this.coin2);
    this.convertedNumber = (this.amount * this.coinPrice1) / this.coinPrice2; // exchange rate
    this.updateUI(
      this.convertedNumber.toFixed(this.convertedNumber > 1 ? 2 : 4)
    );
  }

  /*  updateUI provides an updated display of the conversion rate between the
      two coins provided */
  updateUI(convertedNumber) {
    if (this.tickers.length !== 0) {
      document.getElementById("conversionMessage").textContent = `${
        this.amount
      } ${this.tickers[0].toUpperCase()} = ${
        convertedNumber > 0 ? convertedNumber : 0
      } ${this.tickers[1].toUpperCase()}`;
    }
  }

  /* getFiat is an asynchronous function retrieves fiat data from the rates
     endpoint and uses the data to populate the dropdown menus  */
  getFiat() {
    const fiats = [];
    const requests = this.fiats.map((currency) =>
      fetch(`https://api.coincap.io/v2/rates/${currency}`)
    );

    Promise.all(requests)
      .then( responses => Promise.all( responses.map( res => res.json() ) ) )
      .then( data =>  {
        for ( let fiat of data ) {
          this.fiat.push(fiat.data);
        }
        
        // Assign fiat symbol as keys and rate USD as values
        // to this.prices object
        for (let x of this.fiat) {
          this.prices[x.symbol] = x.rateUsd;
        }
      
        // Combine coin and fiat data
        this.data = this.coins.concat(this.fiat);

        this.populateDropdowns(this.data);
       } )
      .catch( err => console.log(`An error has occurred with function getFiat: ${err}`) );

  }

  // getAssets gets all coin data from assets endpoint and passes it to getFiat
  getAssets() {
    fetch(`https://api.coincap.io/v2/assets`)
      .then((red) => red.json())
      .then((data) => {
        this.coins = Array.from(data.data);
        this.getFiat();
      })
      .catch((err) => {
        console.log(`error ${err}`);
      });
  }

  // initliazeDropdown enables dynamic hiding/showing of options
  // according to input value after dropdown options are populated
  initializeDropdown(dropdown) {
    let input = dropdown.querySelector("input");
    let content = dropdown.querySelector(".dropdownContent");
    let options = content.querySelectorAll(".optionContainer");
    let logoContainer = dropdown.querySelector(".inputContainer input");

    // on input, hide options that don't contain input value
    input.addEventListener("input", function () {
      let searchValue = input.value.toUpperCase();
      options.forEach(function (option) {
        // optionValue grabs the textcontent and the data-value (ticker),
        // enabling the user to search by crypto name or ticker
        let optionValue =
          option.textContent.toUpperCase() +
          option.getAttribute("data-value").toUpperCase();
        if (optionValue.indexOf(searchValue) > -1) {
          option.style.display = "";
        } else {
          option.style.display = "none";
        }
      });
    });

    // if the user clicks input, show dropdown
    input.addEventListener("click", function () {
      content.style.display = "block";
    });

    // if the user clicks outside of dropdown, hide dropdown
    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        content.style.display = "none";
      }
    });

    // when the user clicks an option, assign the data-value to the input value
    options.forEach(function (option) {
      option.addEventListener("click", function () {
        input.value = option.getAttribute("data-value");
        content.style.display = "none";

        // Update the image source in the input container
        let ticker = option.getAttribute("data-value");
        // Fix to get dollar image to display for AUD and CAD
        if (ticker === "AUD" || ticker === "CAD") ticker = "USD";
        logoContainer.style.backgroundImage = `url(https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png)`;
      });
    });
  }

  // populateDropdowns adds an option/logo to the dropdown menus for each
  // asset fetched in getAssets
  populateDropdowns(data) {
    let dropdowns = document.querySelectorAll(".dropdown");
    // Save a reference to the class instance
    let self = this;

    dropdowns.forEach(function (dropdown) {
      let content = dropdown.querySelector(".dropdownContent");
      for (let i = 0; i < data.length; i++) {
        let logo = document.createElement("img");

        let ticker = data[i].symbol;
        //console.log('index: ', i);
        //console.log(data[i].id);
        //console.log(ticker);
        if (ticker === "AUD" || ticker === "CAD") {
          // Fix to get dollar image to show up for AUD and CAD in dropdown menu
          logo.src = `https://assets.coincap.io/assets/icons/usd@2x.png`;
        } else if (ticker === "IOTA") {
          // Fix - IOTA image provided since it's not included in the 'icon' search
          logo.src = `img/iota.png`;
        } else {
          logo.src = `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`;
        }

        let option = document.createElement("a");
        option.href = "#";

        // Format fiat names so they're space separated and capitalized
        if (data[i].type) {
          let words = data[i].id.split("-"),
            word,
            name;

          for (let i = 0; i < words.length; i++) {
            word = words[i].split("");
            word[0] = word[0].toUpperCase();
            word = word.join("");

            words[i] = word;
          }

          name = words.join(" ");
          option.textContent = `${name} (${ticker})`;
        } else {
          option.textContent = `${data[i].name} (${ticker})`;
        }

        let optionContainer = document.createElement("div");
        optionContainer.classList.add("optionContainer");
        content.appendChild(optionContainer);
        optionContainer.appendChild(logo);
        optionContainer.appendChild(option);

        //create new data attribute that holds the ticker
        optionContainer.dataset.value = ticker;
      }
      // Use arrow function to maintain the context of 'this'
      dropdowns.forEach((dropdown) => self.initializeDropdown(dropdown));
    });
  }

  // updateCoinImage searches API for inputted coin, and updates logo source when coin is found
  async updateCoinImage(coinName, inputField) {
    try {
      let name = coinName.toLowerCase();
      if (name.includes(" ")) name = name.split(" ").join("-");

      const response = await fetch(
        `https://api.coincap.io/v2/assets?search=${name}`
      );
      const data = await response.json();
      if (data.data) {
        const ticker = data.data[0].symbol;
        const logoSrc = `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`;
        inputField
          .closest(".dropdown")
          .querySelector(
            ".inputContainer input"
          ).style.backgroundImage = `url(${logoSrc})`;
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  /*  swapCoins get the value and background image URL from each input and 
      swaps them */
  swapCoins() {
    const coinOne = document.querySelector("#currency1").value;
    const coinTwo = document.querySelector("#currency2").value;
    const urlOne = document.querySelector("#currency1").style.backgroundImage;
    const urlTwo = document.querySelector("#currency2").style.backgroundImage;

    document.querySelector("#currency1").value = coinTwo;
    document.querySelector("#currency1").style.backgroundImage = urlTwo;

    document.querySelector("#currency2").value = coinOne;
    document.querySelector("#currency2").style.backgroundImage = urlOne;
  }
}

// Create instance of Converter class
const crypto = new Converter();

/* 
  The event listeners perform crypto amount conversions when the Convert button 
  is clicked or when the user presses enter.
*/
document
  .querySelector("#convert")
  .addEventListener("click", () => crypto.changeAmount());

let input = document.querySelector("#amount"); // Amount of coin 1 to convert

input.addEventListener("keypress", (event) => {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    crypto.changeAmount();
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
   for the 'keypress' action which updates the variables storing coin names. */
for (let i = 0; i < coins.length; i++) {
  coins[i].addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      crypto.changeCoins();
      event.preventDefault();
    }
  });
}

// Add an event listener that runs updateCoinImage as the user inputs coin name
for (let coin of coins) {
  coin.addEventListener("input", function (event) {
    crypto.updateCoinImage(coin.value, coin);
  });
}

crypto.getAssets();

// Event listener for Swap button will run swapCoins() on click
document
  .querySelector("#swap")
  .addEventListener("click", () => crypto.swapCoins());

// TODO: Error message when convert is pressed and < 2 cryptos are selected
