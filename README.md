![CoinCloud logo with a cloud and sun peeking out behind it](/img/cloudLogo2.png "CoinCloud logo")
# CoinCloud Price Converter

CoinCloud Price Converter is a front-end web app that converts a given amount of cryptocurrency or fiat currency to an equivalent amount of another currency.

**Live Preview:** [CoinCloud Price Converter](https://dwnorm2.github.io/crypto-converter/)

## How It's Made:

**Tech used:** 
- HTML5 
- CSS3  
- JavaScript (JS) ES6
- CoinCap RESTful API

Asset data (name, ticker, price, and logo) is pulled from the [CoinCap API](https://docs.coincap.io/). The prices for two selected assets are then converted based on the value in the amount field. Conversion between assets is based on 
each asset's price in USD.

**Features include:**
* Search assets by name or ticker

![A user typing polygon into the search bar](/img/search.gif "Search feature")

* Convert between fiat (see below) and cryptocurrencies
    - United States Dollar (USD)
    - Euro (EUR)
    - Japanense Yen (JPY)
    - British Pound Sterling (GBP)
    - Australian Dollar (AUD)
    - Canadian Dollar (CAD)

![A picture showing 1000 GBP is equivalent to 0.4198116058 ETH](/img/fiat.jpg "Fiat to Crypto conversion")

* Auto-populating dropdowns based on market-cap

![Scrolling down the asset menu showing cryptocurrencies available to choose.](/img/list.gif "Assets choices")

* Swap button

![Swapping between from XMR to BTC conversion to BTC to XMR](/img/swap.gif "Swapping conversion order")

* Auto or toggled dark mode  

![Toggling darkmode on and off](/img/darkmode.gif "Dark mode toggle")

## Optimizations:

- Object-Oriented Programming 
    - Implemented `Converter` class
- Asynchronous (async) Programming
    - Used async/await in favor of promise handlers
- DOM Rendering
    - Loaded specific css styles after DOM content is fully loaded.

## Lessons Learned:

A major takeaway from this project was our understanding of code execution in JS. As a single threaded language, JS can only do one thing at a time. However, a lot of the cool stuff that can be done with JS, particularly on the front-end, is possible due to asynchronous Web APIs such as fetch. 

Coordinating the execution of sync and async code is handled by the Event Loop in JS. The Event Loop executes code on the call stack and when it encounters any
async code it puts that code in the micro task queue. Code in the queue is only run when the call stack is free and all sync code is finished running. This information was key to understand how our code was being executed.  

## Related Projects:
[CoinCloud](https://github.com/dwnorm2/coincloud) - A website providing information on the top 100 cryptocurrencies by market capitalization. Find information outside the top 100 with the search feature!

**Live Preview:** [CoinCloud](https://dwnorm2.github.io/coincloud/)
