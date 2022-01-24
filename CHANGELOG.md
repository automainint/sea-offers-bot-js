## 24.01.2022
*Version 0.2.10*
- Node.js v8 compatibility.
- Fix `resume` command line argument.
- Simplify delay options.
- Timeouts for SDK calls.
- Add private keys option in config.

## 4.12.2021
*Version 0.2.9*
- Use OpenSea SDK v1.2.2.

## 19.11.2021
*Version 0.2.8*
- Add Troubleshooting in README.
- Add option to install with Node v8.11.

## 30.10.2021
*Version 0.2.7*
- Add `skip_if_order_created` option in config.

## 22.10.2021
*Version 0.2.6*
- Error handling fix.

## 18.10.2021
*Version 0.2.5*
- Remove config options:
  - `no_skip`;
  - `exit_timeout`;
  - monitoring settings.
- Add config options:
  - `random_delay`;
  - `acquire_delay`;
  - `acquire_random_delay`;
  - `skip_if_have_bid`;
  - `discard_threshold`.
- Rename config options:
  - `log_all` to `log_full`;
  - `skip_if_lower` to `skip_if_too_high`;
  - `fail_threshold` to `switch_threshold`.
- Add `--resume=<line>` command line argument.
- Check for success with error.
- Remove scheduling and async code for better stability.

## 29.09.2021
*Version 0.2.4*
- Add fetch timeout in config.
- Add `log_all` option in config.

## 27.09.2021
*Version 0.2.3*
- Mutex fixes.

## 23.09.2021
*Version 0.2.2*
- Use mutex locking for processing.
- `skip_if_lower` and `skip_if_owner_is_buyer` options in config.
- Fetch cache.
- Add proxy switching delay.
- Hotfixes:
  - OpenSea wETH approval requests disabled.
  - Add error handler for `safe-event-emitter`.

## 22.09.2021
*Version 0.2.1*
- Tag `v0.2.1`.
- Add proxy notation in `README`.

## 15.09.2021
*Version 0.1.12*
- Add `restart_threshold` option in config.
- Add `proxy_checking` option in config.
- Add `log_fetch` option in config.
- Destroy agents when switch proxy.
- Don't fetch asset if no need.

## 11.09.2021
*Version 0.1.11*
- Expiration time bug fix.

## 10.09.2021
*Version 0.1.10*
- Improve proxy support.
- Add socks proxy support.
- Add proxy checking.
- Add Cookie and User-Agent in config.

## 09.09.2021
*Version 0.1.9*
- Add http proxy support.
- Add restart delay option.

## 08.09.2021
*Version 0.1.8*
- Add no skip option in config.

*Version 0.1.7*
- Skipping fix.

*Version 0.1.6*
- Advanced price settings in list file.
- Auto restart.
- Progress saving.
- No duplicate offers.

## 07.09.2021
*Version 0.1.5*
- Auto price feature.
- Event handling.

## 04.09.2021
*Version 0.1.4*
- Monitoring feature.
