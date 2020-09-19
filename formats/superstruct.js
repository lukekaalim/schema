// @flow strict
/*:: import type { Schema } from '../main'; */
/*::
type SuperStructLib = {
  array: (element: Struct) => Struct,
  object: (properties: { [string]: Struct }) => Struct,

  string: () => Struct,
  number: () => Struct,
  boolean: () => Struct,

  literal: (mixed) => Struct,
  nullable: (option: Struct) => Struct,
  tuple: (elements: Struct[]) => Struct,
  union: (options: Struct[]) => Struct,
};
declare opaque type Struct;
*/

const createStruct = (s/*: SuperStructLib*/, schema/*: Schema*/)/*: Struct*/ => {
  switch (schema.type) {
    // primitive
    case 'string':
      return s.string();
    case 'boolean':
      return s.boolean();
    case 'number':
      return s.number();
    case 'null':
      return s.literal(null);
    // compound
    case 'array':
      return s.array(createStruct(s, schema.elementSchema));
    case 'object':
      return s.object(Object.fromEntries(
        schema.propertySchemas.map(([propertyName, schema]) => [propertyName, createStruct(s, schema)])
      ));
    // branch
    case 'union':
      return s.union(schema.options.map(schema => createStruct(s, schema)))
    case 'optional':
      return s.nullable(createStruct(s, schema.option));
    // literal
    case 'number-literal':
    case 'boolean-literal':
    case 'string-literal':
      return s.literal(schema.literalValue);
    case 'tuple':
      return s.tuple(schema.tupleSchemas.map(schema => createStruct(s, schema)))
    // meta
    case 'name':
      return createStruct(s, schema.namedSchema);
    case 'id':
      return createStruct(s, schema.identifiedSchema);
    default:
      (schema/*: empty*/)
      throw new Error('Unimplemented');
  }
};

module.exports = {
  createStruct,
};