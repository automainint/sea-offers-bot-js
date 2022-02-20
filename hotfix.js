/*  Copyright (c) 2022 Mitya Selivanov
 */

'use strict';

async function hotfix() {
  const { copyFile } = require('fs');

  console.log('\nRun hotfix...');

  /*  Proper error handling.
   */
  console.log('* Fix safe-event-emitter error handling.');
  await copyFile(
    './hotfix/safe-event-emitter-index.js',
    './node_modules/safe-event-emitter/index.js',
    (err) => {
      if (err) {
        console.log(err);
      }
    });

  /*  Disable wETH approval.
   */
  console.log('* Disable opensea-js wETH approval.');
  await copyFile(
    './hotfix/opensea-lib-seaport.js',
    './node_modules/opensea-js/lib/seaport.js',
    (err) => {
      if (err) {
        console.log(err);
      }
    });
}

hotfix().then(() => {
  console.log('Hotfix done.\n');
});
