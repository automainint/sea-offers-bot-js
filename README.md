# sea-offers-bot-js
Multiple buy orders **bot** for **OpenSea** with automatic price calculation and proxy support.

If something don't work, feel free to [create an issue][issues-link].

[Contact me][contact-link] if you need access to unobfuscated source code, guidance, or you have a new feature proposal.

## Some tips to successfully run automatic operations on OpenSea
- Have an OpenSea API key.
- Use proxies. In case you don't have a good private proxy, Tor is currently better than any bad or public proxy.
- Specify Cookies and User-Agent.
- Specify random delays.
- You can run multiple bot instances simultaneously with different configurations.
- Don't do too many requests in a short time.

You can use this bot alongside with [tor-multiproxy][tor-multiproxy-link].

Be very precautious with automatic trading!

## Configuration

### Required settings
- `network` - network name (use `mainnet` or `rinkeby`).
- `infura_key` or `alchemy_key` - Infura or Alchemy node API key.
- `mnemonic` - MetaMask mnemonic phrase.
- `wallet_address` - buyer wallet address.

### Optional settings
- `opensea_key` - OpenSea API key. Optional, recommended for multiple requests.
- `expiration` - expiration time for offer in hours. Default: `24`.
- `discard_threshold` - how much consecutive fails to discard an offer. Default: `10`.
- `restart_threshold` - how much consecutive fails to restart. Default: `20`.
- `price_auto` - enable auto price calculation. Default: `true`.
  - Price will be calculated as `H` + `epsilon`, where `H` is the current highest offer price.
  - `price_floor` - minimum price in `wETH`. Default: `0.0001`.
  - `price_roof` - maximum price in `wETH`. Default: `1`.
  - `price_epsilon` - price increment in `wETH`. Default: `0.0001`.
- Delay options:
  - `delay` - delay between buy orders in milliseconds. Default: `5000`.
  - `random_delay` - additional delay roof in milliseconds. Default: `5000`.
  - `acquire_delay` - delay after acquiring an asset in milliseconds. Default: `1000`.
  - `acquire_random_delay` - additional acquiring delay roof in milliseconds. Default: `1000`.
  - Actual delay between offers will be in range:
    - from `delay` + `acquire_delay`;
    - to `delay` + `acquire_delay` + `random_delay` + `acquire_random_delay`.
  - `restart_delay` - delay for restart after a fatal error. Default: `5000`.
- Skipping options:
  - `skip_if_have_bid` - skip offer duplicates. Default: `true`.
  - `skip_if_too_high` - skip an offer if the roof price is lower then the current highest bid. Default: `true`.
  - `skip_if_owner_is_buyer` - skip an asset if you already own it. Default: `true`.
  - `skip_if_order_created` - skip an asset if an error occured but order was created. Default: `true`.
- Logging options:
  - `log_fetch` - log fetch calls. Default: `false`.
  - `log_full` - log full error messages. Default: `false`.
- Proxy settings:
  - `proxy_list` - proxies list file. No proxy by default.
  - `proxy_protocol` - proxy protocol. Should be `http://` or `socks://`. Default: `http://`.
  - `proxy_checking` - enable proxy checking. Default: `true`.
  - `switch_threshold` - how much fails to switch proxy. Default: `10`.
  - `switch_delay` - proxy switching delay in milliseconds. Default: `5000`.
- HTTP request options:
  - `cookie` - Cookie data. No Cookie by default.
  - `user_agent` - User-Agent data. No User-Agent by default.
  - `cache_time` - fetch cache timeout in milliseconds. Default: `5000`.
  - `fetch_timeout` - timeout for fetch requests in milliseconds. Default: `5000`.

Values `floor`, `roof`, `epsilon` for price calculation will be taken from the assets list file if specified, or from the config otherwise.

If auto price calculation is disabled, only the `floor` value will be used to create a buy order.

Default config file: `config.json`.

**Example**
```json
{
  "network":        "rinkeby",
  "infura_key":     "<your Infura API key>",
  "mnemonic":       "<your MetaMask mnemonic phrase>",
  "wallet_address": "<your wallet address>",

  "price_auto":     true,
  "price_floor":    0.001,
  "price_roof":     100,
  "price_epsilon":  0.001,

  "expiration":     4,

  "delay":                500,
  "random_delay":         500,
  "acquire_delay":        500,
  "acquire_random_delay": 500
}
```

## Assets list file
Each line contains a link to the asset on OpenSea and floor, roof, epsilon price values in `wETH` as floating-point numbers. If there is no value specified, it will be taken from the config. First number is `floor`, second is `roof` and last is `epsilon`.

Asset line notation: `<link to asset> [floor price] [roof price] [epsilon]`

Default list file: `list.txt`.

**Example**
```
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/100 0.01 100
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/200
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/300 0.2 200 0.1
```

## Proxies list file
Available proxy notation:
- `protocol://user:pass@host:port`
- `protocol://host:port:user:pass`

Available protocols:
- `http://` - for HTTP proxy.
- `socks://` - for SOCKS 4/5 proxy.

Host should be an IPv4 address. Protocol can be omitted, in which case the value `proxy_protocol` from the configuration will be used.

**Example**
```
socks://127.0.0.1:9050
127.0.0.1:8080
```

## Command line arguments
- `--file=<file name>` - assets list file. Default: `list.txt`.
- `--config=<file name>` - config file. Default: `config.json`.
- `--output=<file name>` - output log file. Default: `log.txt`.
- `--proxy=<file name>` - proxies list file. No proxy by default.
- `--verbose` - print all messages to the console. Disabled by default.
- `--seaverb` - print OpenSea log messages. Disabled by default.
- `--printinfo` - don't create buy orders, but print the assets info. Disabled by default.
- `--stop` - stop currently running bot instance.
- `--resume=<line>` - resume progress from specified line.

## Usage
You should have an Infura or Alchemy API key, an OpenSea API key, an OpenSea account and a MetaMask account.

Make sure to have installed recent version of **Node.js** with **Git**, **Python** and **C/C++** build tools (**npm** may require this to install dependencies).
- Install the package.
- Create a config file.
- Run `offers.js`.

**Example**
```shell
npm install
node offers.js --config=config.json --file=list.txt
```

**Demo video** - https://youtu.be/sGwS2v-S2wk

## For tip
- `btc` Bitcoin `bc1qau5y9wf49ammclhscuelwlm6370d9lqph6g9um`
- `btc` Bitcoin (Legacy) `369h9iMSq8ihjYMwdwhbn2ffXMrprHvxav`
- `eth` Ethereum `0x98556fb56e3079696738579dBE70a5Fa761110b9`

[tor-multiproxy-link]: https://github.com/automainint/tor-multiproxy
[issues-link]:         https://github.com/automainint/sea-offers-bot-js/issues
[contact-link]:        https://guattari.ru/contact
