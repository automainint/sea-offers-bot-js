# sea-offers-bot-js
Multiple buy orders bot for OpenSea.

## Config
- `network` - network name (use `mainnet` or `rinkeby`).
- `infura_key` or `alchemy_key` - Infura or Alchemy node API key.
- `mnemonic` - MetaMask mnemonic phrase.
- `wallet_address` - buyer wallet address.
- `opensea_key` - OpenSea API key. Optional, recommended for multiple requests.
- `delay` - delay between buy orders in milliseconds. Default: `1000`.
- `expiration` - expiration time for offer in hours. Default: `24`.
- `exit_timeout` - timeout in milliseconds for checking if all tasks done. Default: `2000`.
- `monitoring_enabled` - if true, bot will try to buy an asset until success. Default: `false`.
- `monitoring_delay` - delay between buy order attempts in milliseconds. Default: `1000`.

Default config file: `config.json`.

**Example**
```json
{
  "network": "rinkeby",
  "infura_key": "<your Infura API key>",
  "mnemonic": "<your MetaMask mnemonic phrase>",
  "wallet_address": "<your wallet address>",

  "delay": 500,
  "expiration": 4,

  "monitoring_enabled": true,
  "monitoring_delay": 5000
}
```

## Assets list file
Each line containts a link to the asset on the OpenSea and a price as a floating-point number.

Default list file: `list.txt`.

**Example**
```
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/6086 0.01
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/4367 0.01
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/11 0.02
```

## Command line arguments
- `--file=<file name>` - assets list file. Default: `list.txt`.
- `--config=<file name>` - config file. Default: `config.json`.
- `--output=<file name>` - output log file. Default: `log.txt`.
- `--verbose` - print all messages to console. Disabled by default.
- `--seaverb` - print OpenSea log messages. Disabled by default.
- `--printinfo` - don't create buy orders, but print assets info. Disabled by default.

## Usage
You should have an Infura or Alchemy API key, an OpenSea API key, an OpenSea account and a MetaMask account.
- Install the package.
- Create a config file.
- Run `offers.js`.

**Example**
```shell
npm install
node offers.js --config=config.json --file=list.txt
```
