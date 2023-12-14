let btcPrice = 0;
let ethPrice = 0;
let convertedNumber = 0;

document.querySelector("button").addEventListener("click", changeAmount);

let input = document.querySelector("input");

let amount = Number(document.querySelector("input").value);

function changeAmount() {
  amount = Number(document.querySelector("input").value);
  convert();
}

input.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    changeAmount();
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.querySelector("button").click();
  }
});

///

async function searchBTC() {
  try {
    const response = await fetch(`https://api.coincap.io/v2/assets/bitcoin`);
    const data = await response.json();
    if (data.data) {
      return data.data.priceUsd;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

async function searchETH() {
  try {
    const response = await fetch(`https://api.coincap.io/v2/assets/ethereum`);
    const data = await response.json();
    if (data.data) {
      return data.data.priceUsd;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

async function convert() {
  btcPrice = await searchBTC();
  ethPrice = await searchETH();
  convertedNumber = (amount * btcPrice) / ethPrice;
  updateUI(convertedNumber.toFixed(convertedNumber > 1 ? 2 : 4));
}

convert();

function updateUI(convertedNumber) {
  document.getElementById("conversionMessage").textContent = `${amount} BTC = ${
    convertedNumber > 0 ? convertedNumber : 0
  } ETH`;
  // let ticker = data.symbol;
  // document.getElementById(
  //   "logo"
  // ).src = `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`;
}
