# CoinCloud Price Converter

CoinCloud Price Converter is a web app that converts a given amount of cryptocurrency to the equivalent amount of a different cryptocurrency.

**Live:** [Crypto Converter](https://dwnorm2.github.io/crypto-converter/)

## How It's Made:

**Tech used:** HTML, CSS, JavaScript, CoinCap API

Asset data (name/price/logo) is pulled from the [CoinCap API](https://docs.coincap.io/). The prices for two selected assets are then converted based on the value in the amount field.

Features include:
* Auto-populating dropdowns based on market-cap
* Swap button
* Auto dark mode

## Lessons Learned:

A major takeaway from this project was the timing of code executions. Optimizations include async/await, as well as triggering certain css styles after DOM content is fully loaded.

## More Projects:
[CoinCloud](https://github.com/dwnorm2/coincloud)
