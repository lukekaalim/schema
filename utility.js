// @flow strict
/*:: import type { Schema, ObjectSchema } from './main'; */
const { idSchema, nameSchema } = require("./meta");
const { unionSchema } = require("./branches");
const { objectSchema } = require("./primitives");
const { literal } = require("./literals");

const defineSchema = (
  id/*: string*/,
  description/*: string*/,
  definedSchema/*: Schema*/,
) => (
  idSchema(id, nameSchema('', description, definedSchema))
);

const taggedUnion = (tagUnionMap/*: { [string]: ObjectSchema }*/) => {
  const entries/*: [string, ObjectSchema][]*/ = (Object.entries(tagUnionMap)/*: any*/);

  return unionSchema(entries.map(([tag, schema]) => objectSchema([
    ['type', literal(tag)],
    ...schema.propertySchemas
  ])))
};

const properties = (propertyMap/*: { [string]: Schema }*/)/*: [string, Schema][]*/ => {
  const entries/*: [string, Schema][]*/ = (Object.entries(propertyMap)/*: any*/);
  return entries;
}

module.exports = {
  defineSchema,
  taggedUnion,
  properties,
  define: defineSchema,
  tag: taggedUnion,
  props: properties,
};