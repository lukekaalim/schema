// @flow strict
const { assert } = require('@lukekaalim/test');
const { object, lit, props } = require('./main');

const testTag = () => {
  const { tag } = require('./utility');

  const taggedStruct = tag({
    'cowboy': object(props({ 'hello': lit('partner') })),
    'astronaut': object(props({ 'hello': lit(', over!') })),
    'pirate': object(props({ 'hello': lit('yarr!') })),
  });

  return assert('tag forms a valid union of all keys', [
    assert('tag formed a struct that is a union', taggedStruct.type === 'union'),
    assert('the union contains the same number of elements than there were keys',
      taggedStruct.type === 'union' && taggedStruct.options.length === 3
    ),
  ]);
};

module.exports = {
  testTag,
};