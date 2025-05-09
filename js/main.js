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

    if (this.amount < 0) {
      // Display error message to user if they enter a negative number
      document.querySelector(
        "#conversionMessage"
      ).innerText = `Invalid input: Negative numbers not allowed.`;
    } else {
      this.changeCoins();
      this.convert();
    }
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
        `https://rest.coincap.io/v3/assets/${name}`,
        {
          headers: {
            Authorization: `Bearer 73a828abcf14d386c1dcbe6a2146164e44773501136411c1060c8f3e6a3324e7`,
          },
        }
      );
      const data = await response.json();
      if (data.data) {
        if (coin !== "") this.tickers.push(data.data.symbol);
        return data.data.priceUsd;
      } else {
        console.error(`Asset not found: ${coin}`);
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

    if (this.convertedNumber < 1) {
      // for amounts less than 1
      this.updateUI(this.convertedNumber.toFixed(10));
    } else if (this.convertedNumber < 1000) {
      // for amounts that don't require commas
      this.updateUI(this.convertedNumber.toFixed(2));
    } else {
      /*
      This regex uses positive lookahead to find every digit that is followed by
      groups of three digits before a decimal point. 
      
      It then replaces those digits with the digit followed by a comma.
      */
      this.updateUI(
        this.convertedNumber.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
      );
    }
  }

  /*  updateUI provides an updated display of the conversion rate between the
      two coins provided */
  updateUI(convertedNumber) {
    if (this.tickers.length !== 0) {
      document.getElementById("conversionMessage").textContent = `${
        this.amount
      } ${this.tickers[0].toUpperCase()} = ${
        // Checks for numbers already formatted with commas
        convertedNumber > 0 || convertedNumber.includes(",")
          ? convertedNumber
          : 0
      } ${this.tickers[1].toUpperCase()}`;
    }
  }

  /* getFiat is an asynchronous function retrieves fiat data from the rates
     endpoint and uses the data to populate the dropdown menus  */
  getFiat() {
    const requests = this.fiats.map((currency) =>
      fetch(`https://rest.coincap.io/v3/rates/${currency}`, {
        headers: {
          Authorization: `Bearer 73a828abcf14d386c1dcbe6a2146164e44773501136411c1060c8f3e6a3324e7`,
        },
      })
    );

    Promise.all(requests)
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .then((data) => {
        for (let fiat of data) {
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
      })
      .catch((err) =>
        console.log(`An error has occurred with function getFiat: ${err}`)
      );
  }

  // getAssets gets all coin data from assets endpoint and passes it to getFiat
  getAssets() {
    fetch(`https://rest.coincap.io/v3/assets`, {
      headers: {
        Authorization: `Bearer 73a828abcf14d386c1dcbe6a2146164e44773501136411c1060c8f3e6a3324e7`,
      },
    })
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

    // when the user clicks an option, assign the slug to the input value
    options.forEach(function (option) {
      option.addEventListener("click", function () {
        input.value = option.getAttribute("data-slug"); // Use slug instead of ticker
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
        let slug = data[i].id; // Get the slug (e.g., 'bitcoin' for BTC)

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

        // Create new data attributes for the ticker and slug
        optionContainer.dataset.value = ticker; // Ticker symbol
        optionContainer.dataset.slug = slug; // Slug
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
        `https://rest.coincap.io/v3/assets/${name}`,
        {
          headers: {
            Authorization: `Bearer 73a828abcf14d386c1dcbe6a2146164e44773501136411c1060c8f3e6a3324e7`,
          },
        }
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

  /* darkMode will toggle dark styles on body*/
  darkMode() {
    const body = document.querySelector("body");

    body.classList.toggle("dark");
  }

  /* darkDropdowns will toggle dark styles on dropdown elements if body contains the "dark" class*/
  darkDropdowns() {
    const body = document.querySelector("body");
    const inputs = document.querySelectorAll(
      "input, .inputContainer input, .dropdownContent, .optionContainer"
    );
    const dropdownInputs = document.querySelectorAll(".inputContainer input");
    const optionLinks = document.querySelectorAll(".optionContainer a");
    const hoverStyles = document.querySelectorAll(
      ".dropdownContent .optionContainer"
    );

    if (body.classList.contains("dark")) {
      inputs.forEach((input) => input.classList.add("inputDark"));
      dropdownInputs.forEach((input) =>
        input.classList.add("dropdownInputDark")
      );
      optionLinks.forEach((link) => link.classList.add("aDark"));
      hoverStyles.forEach((style) => style.classList.add("hoverDark"));
    } else {
      inputs.forEach((input) => input.classList.remove("inputDark"));
      dropdownInputs.forEach((input) =>
        input.classList.remove("dropdownInputDark")
      );
      optionLinks.forEach((link) => link.classList.remove("aDark"));
      hoverStyles.forEach((style) => style.classList.remove("hoverDark"));
    }
  }
}

// Create instance of Converter class
const crypto = new Converter();

// Listen for a click on the cloud logo and toggle dark mode on/off
document.querySelector("#cloud").addEventListener("click", function () {
  crypto.darkMode();
  crypto.darkDropdowns();
});

// toggle dark mode based on user system settings
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (isDarkMode) {
  crypto.darkMode();
  crypto.darkDropdowns();
}

// run darkDropdowns when dropdowns are clicked. This fixes a bug where the dropdowns would try to darken before the elements are fully loaded
document.querySelectorAll(".dropdown").forEach((dropdown) => {
  dropdown.addEventListener("click", () => {
    crypto.darkDropdowns();
  });
});

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
document.querySelector("#swap").addEventListener("click", function () {
  crypto.swapCoins();
  crypto.changeAmount();
});

// TODO: Error message when convert is pressed and < 2 cryptos are selected
