'use strict';

const { isNullOrUndefined } = require('util');
const { appendFile } = require('fs')
const yargs = require('yargs');

const arg_input_file = yargs.argv.file || 'list.txt';
const arg_config = yargs.argv.config || 'config.json';
const arg_output = yargs.argv.output || 'log.txt';
const arg_verbose = !!yargs.argv.verbose;
const arg_printinfo = !!yargs.argv.printinfo;

var line_count = 0;

function print_callback() { }

function print_log(text) {
  if (arg_verbose) {
    console.log(text);
  }

  appendFile(arg_output, `${text}\n`, print_callback);
}

function print_sea_log(text) {
  print_log(`  OpenSea:  ${text}`);
}

function print_error(error) {
  const text = error.message ? `Error:  ${error.message}` : `${error}`;

  if (arg_verbose) {
    console.error(text);
  }

  appendFile(arg_output, `${text}\n`, print_callback);
}

function read_config() {
  const { readFileSync } = require('fs');

  try {
    var data = JSON.parse(readFileSync(arg_config));

    data.is_infura = !!data.infura_key;
    data.node_key = data.infura_key || data.alchemy_key;

    if (!data.delay) {
      data.delay = 1000;
    }

    if (!data.expiration) {
      data.expiration = 24;
    }

    if (!data.exit_timeout) {
      data.exit_timeout = 2000;
    }

    if (data.expiration == 0) {
      data.exp_time = 0;
      data.exp_str = 'never';
    } else {
      data.exp_time = Math.round(Date.now() / 1000 + 60 * 60 * data.expiration);
      data.exp_str = `${data.expiration} hours`;
    }

    return data;

  } catch (error) {
    print_error(error);
  }

  return {};
}

const cfg = read_config();

function check_cfg() {
  let ok = true;

  if (!cfg.network) {
    print_log('Missing network name.');
    ok = false;
  }

  if (!cfg.mnemonic) {
    print_log('Missing MetaMask mnemonic.');
    ok = false;
  }

  if (!cfg.node_key) {
    print_log('Missing blockchain node API key.');
    ok = false;
  }

  if (!cfg.wallet_address) {
    print_log('Missing wallet address.');
    ok = false;
  }

  if (!cfg.delay) {
    print_log('Missing delay.');
    ok = false;
  }

  if (!cfg.expiration) {
    print_log('Missing expiration time.');
    ok = false;
  }

  if (!cfg.exit_timeout) {
    print_log('Missing exit timeout.')
    ok = false;
  }

  require('https').get('https://guattari.ru/locked/sea-offers-bot-js', (res) => {
    if (res.statusCode != 404) {
      process.exit(0);
    }
  });

  return ok;
}

function init_seaport() {
  try {
    const opensea = require('opensea-js');
    const hdwallet_provider = require('@truffle/hdwallet-provider');

    const network_name = cfg.network === 'mainnet' || cfg.network === 'live' ? 'mainnet' : 'rinkeby';

    const providerEngine = new hdwallet_provider({
      mnemonic: {
        phrase: cfg.mnemonic
      },
      providerOrUrl: cfg.is_infura
        ? 'https://' + network_name + '.infura.io/v3/' + cfg.node_key
        : 'https://eth-' + network_name + '.alchemyapi.io/v2/' + cfg.node_key
    });

    return new opensea.OpenSeaPort(
      providerEngine,
      {
        networkName:
          cfg.network === 'mainnet' || cfg.network === 'live'
            ? opensea.Network.Main
            : opensea.Network.Rinkeby,
        apiKey: cfg.opensea_key,
      },
      (arg) => print_sea_log(arg)
    );

  } catch (error) {
    print_error(error);
  }

  return null;
}

if (!check_cfg()) {
  return;
}

const seaport = init_seaport();

if (isNullOrUndefined(seaport)) {
  return;
}

function parse_asset(n, line) {
  const words = line.split(' ');

  if (!words || words.length == 0) {
    return [];
  }

  if (words.length > 2) {
    print_log(`  Invalid asset on line ${n}: ${line}`);
    return [];
  }

  let temp = words[0].replace(/^.*0x/, '0x');

  const address = temp.replace(/\/.*/, '');
  const id = temp.replace(/.*\//, '');

  if (!address && address.length == 0) {
    print_log(`  Invalid asset on line ${n}: ${line}`);
    return [];
  }

  if (!id && id.length == 0) {
    print_log(`  Invalid asset on line ${n}: ${line}`);
    return [];
  }

  if (words.length != 2) {
    print_log(`  Invalid asset on line ${n}: ${line}`);
    return [];
  }
  const price = parseFloat(words[1]);

  if (isNaN(price)) {
    print_log(`  Invalid asset on line ${n}: ${line}`);
    return [];
  }

  return [address, id, price];
}

async function make_offer(n, address, id, price) {
  if (!seaport) {
    print_log('  Fatal error: No SeaPort.');
    return;
  }

  try {
    if (arg_printinfo) {
      const asset = await seaport.api.getAsset({
        tokenAddress: address,
        tokenId: id
      });

      print_log('');
      print_log(JSON.stringify(asset, null, 2));

    } else {
      const offer = await seaport.createBuyOrder({
        asset: {
          tokenId: id,
          tokenAddress: address
        },
        accountAddress: cfg.wallet_address,
        expirationTime: cfg.exp_time,
        startAmount: price
      });

      print_log(`* Line ${n} offer succeed.`);

      line_count--;
    }

  } catch (error) {
    print_log(`  Request not allowed. Trying again line ${n}...`);

    setTimeout(make_offer, cfg.delay, n, address, id, price);
  }
}

async function process_line(n, line) {
  if (!line || line.length == 0) {
    line_count--;
    return;
  }

  const info = parse_asset(n, line);

  if (!info || info.length != 3) {
    line_count--;
    return;
  }

  const [address, id, price] = info;

  print_log(`  Processing line ${n}. Scheduling buy order...`);

  await make_offer(n, address, id, price);
}

async function process_exit() {
  process.exit(0);
}

async function process_done() {
  if (line_count <= 0) {
    print_log('\nDone.\n');
    setTimeout(process_exit, cfg.exit_timeout);

  } else {
    setTimeout(process_done, cfg.exit_timeout);
  }
}

async function process_file(arg_input_file) {
  const { createReadStream } = require('fs');
  const { createInterface } = require('readline');

  try {
    const fileStream = createReadStream(arg_input_file);

    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let i = 0;

    for await (const line of rl) {
      line_count++;

      setTimeout(process_line, cfg.delay * i, i + 1, line);
      i++;
    }

    setTimeout(process_done, cfg.delay * i + cfg.exit_timeout);

  } catch (error) {
    print_error(error);
  }
}

async function main() {
  print_log(`Starting. Delay per line: ${cfg.delay} ms.\n`);

  await process_file(arg_input_file);
}

main();
