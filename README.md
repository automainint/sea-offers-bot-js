# sea-offers-bot-js

Multiple buy orders bot for OpenSea.

## Environment variables

- `MNEMONIC` - MetaMask mnemonic phrase.
- `INFURA_KEY` or `ALCHEMY_KEY` - Infura or Alchemy API key.
- `WALLET_ADDRESS` - buyer wallet address.
- `OPENSEA_KEY` - OpenSea API key. Optional, required for multiple requests.
- `NETWORK` - network name (use `mainnet` or `rinkeby`).

**Example** (for Linux)
```
export INFURA_KEY=<your Infura API key>
export MNEMONIC="<your MetaMask mnemonic phrase>"
export WALLET_ADDRESS=<your wallet address>
export OPENSEA_KEY=<your OpenSea API key>
export NETWORK=rinkeby
```

## Command line arguments

- `--price=<price value>` - set the base price for an offer.
- `--file=<path to file>` - set the path to the assets list file.

## Assets list file

Each line containts a link to the asset on the OpenSea and an optional price coefficient as a floating-point number.

**List file example**
```
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/6086
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/4367 1.5
https://testnets.opensea.io/assets/0x08a62684d8d609dcc7cfb0664cf9aabec86504e5/11 2
```

## Usage

You should have an Infura or Alchemy API key, an OpenSea API key, an OpenSea account and a MetaMask account.

- Install the package.
- Setup environment variables.
- Run `offers.js`.

**Example**
```
npm install
node offers.js --price=0.01 --file=list.txt
```
