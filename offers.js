'use strict';

const env_mnemonic = process.env.MNEMONIC;
const env_node_api_key = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const is_infura = !!process.env.INFURA_KEY;
const env_wallet_address = process.env.WALLET_ADDRESS;
const env_network = process.env.NETWORK;
const env_opensea_key = process.env.OPENSEA_KEY || "";

const { isNullOrUndefined } = require('util');
const yargs = require('yargs');
const arg_offer_price = parseFloat(yargs.argv.price);
const arg_input_file = yargs.argv.file;

function check_env() {
  if (!env_mnemonic) {
    console.error('Missing mnemonic env variable.');
  }

  if (!env_node_api_key) {
    console.error('Missing Alchemy/Infura key env variable.');
  }

  if (!env_wallet_address) {
    console.error('Missing wallet address env variable.');
  }

  if (!env_network) {
    console.error('Missing network env variable.');
  }

  if (!env_opensea_key) {
    console.error('Missing OpenSea API key.');
  }

  if (!env_mnemonic || !env_node_api_key || !env_wallet_address || !env_network || !env_opensea_key) {
    console.log('\nPlease set a mnemonic, Alchemy/Infura key, wallet address, network, OpenSea API key.');
    console.log('\nSetting env vars (for Linux)\n');
    console.log('  export MNEMONIC="<mnemonic>"');
    console.log('  export INFURA_KEY=<Infura API key>');
    console.log('  export WALLET_ADDRESS=<Wallet address>');
    console.log('  export NETWORK=<network>');
    console.log('  export OPENSEA_KEY=<OpenSea API key>\n');
    return false;
  }

  return true;
}

function check_args() {
  if (isNaN(arg_offer_price)) {
    console.error('Missing offer price (--price).');
  }

  if (!arg_input_file) {
    console.error('Missing input file (--file).');
  }

  if (isNaN(arg_offer_price) || !arg_input_file) {
    console.log('\nInvalid arguments.');
    console.log('\nUsage:\n\n  node offers.js --price=<price value> --file=<input file>');
    return false;
  }

  return true;
}

function init_seaport() {
  try {
    const opensea = require("opensea-js");
    const hdwallet_provider = require("@truffle/hdwallet-provider");

    const network_name = env_network === "mainnet" || env_network === "live" ? "mainnet" : "rinkeby";

    const providerEngine = new hdwallet_provider({
      mnemonic: {
        phrase: env_mnemonic
      },
      providerOrUrl: is_infura
        ? "https://" + network_name + ".infura.io/v3/" + env_node_api_key
        : "https://eth-" + network_name + ".alchemyapi.io/v2/" + env_node_api_key
    });

    return new opensea.OpenSeaPort(
      providerEngine,
      {
        networkName:
          env_network === "mainnet" || env_network === "live"
            ? opensea.Network.Main
            : opensea.Network.Rinkeby,
        apiKey: env_opensea_key,
      },
      (arg) => console.log(arg)
    );

  } catch (error) {
    if (error.message) {
      console.error('Error: ' + error);
    } else {
      console.error(error);
    }
  }

  return null;
}

if (!check_env()) {
  return;
}

const seaport = init_seaport();

if (isNullOrUndefined(seaport)) {
  return;
}

function parse_asset(line) {
  const words = line.split(' ');

  if (!words || words.length == 0) {
    return [];
  }

  if (words.length > 2) {
    console.error(`Invalid asset: ${line}`);
    return [];
  }

  let temp = words[0].replace(/^.*0x/, '0x');

  const address = temp.replace(/\/.*/, '');
  const id = temp.replace(/.*\//, '');

  if (!address && address.length == 0) {
    console.error(`Invalid asset: ${line}`);
    return [];
  }

  if (!id && id.length == 0) {
    console.error(`Invalid asset: ${line}`);
    return [];
  }

  if (words.length == 2 && words[1].length > 0) {
    const coeff = parseFloat(words[1]);

    if (isNaN(coeff)) {
      console.error(`Invalid asset: ${line}`);
      return [];
    }

    return [address, id, arg_offer_price * coeff];
  }

  return [address, id, arg_offer_price];
}

async function make_offer(address, id, price) {
  if (!seaport) {
    console.error('Fatal error: No SeaPort.');
    return;
  }

  try {
    const asset = await seaport.api.getAsset({
      tokenAddress: address,
      tokenId: id
    });

    if (yargs.argv.printinfo) {
      console.log('');
      console.log(asset);

    } else {
      console.log('\nCreate offer...\n');
      console.log('  Token address: ' + address);
      console.log('  Token id:      ' + id);
      console.log('  Offer price:   ' + price);
      console.log('  Wallet:        ' + env_wallet_address);

      const offer = await seaport.createBuyOrder({
        asset: {
          tokenId: id,
          tokenAddress: address
        },
        accountAddress: env_wallet_address,
        startAmount: price
      });
    }

  } catch (error) {
    if (error.message) {
      console.error('Error: ' + error.message);
    } else {
      console.error(error);
    }
  }
}

async function process_line(line) {
  if (!line || line.length == 0) {
    return;
  }

  const info = parse_asset(line);

  if (!info || info.length != 3) {
    return;
  }

  const [address, id, price] = info;

  await make_offer(address, id, price);
}

async function process_file(arg_input_file) {
  const { createReadStream } = require('fs');
  const { createInterface } = require('readline');

  const fileStream = createReadStream(arg_input_file);

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    await process_line(line);
  }
}

async function main() {
  if (check_args()) {
    await process_file(arg_input_file);
  }

  console.log('\nDone.');
}

main();
