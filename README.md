# sea-offers-bot-js

Multiple buy orders bot for OpenSea.

## Config

`network` - network name (use `mainnet` or `rinkeby`).
`infura_key` or `alchemy_key` - Infura or Alchemy node API key.
`mnemonic` - MetaMask mnemonic phrase.
`wallet_address` - buyer wallet address.
`opensea_key` - OpenSea API key. Optional, recommended for multiple requests.
`delay` - delay between buy orders in milliseconds.
`expiration` - expiration time for offer in hours.

Default config file: `config.json`.

**Example**
```
{
  "network": "rinkeby",
  "infura_key": "<your Infura API key>",
  "mnemonic": "<your MetaMask mnemonic phrase>",
  "wallet_address": "<your wallet address>",

  "delay": 500,
  "expiration": 4
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

## Usage

You should have an Infura or Alchemy API key, an OpenSea API key, an OpenSea account and a MetaMask account.

- Install the package.
- Create a config file.
- Run `offers.js`.

**Example**
```
npm install
node offers.js --config=config.json --file=list.txt
```
