// @flow strict
const { assert, colorReporter, exitCodeReporter } = require('@lukekaalim/test');

const test = async () => {
  const assertion = assert('@lukekaalim/schema', [
    require('./utility.test').testTag(),
  ]);
  console.log(colorReporter(assertion));
  process.exitCode = exitCodeReporter(assertion);
};

test();