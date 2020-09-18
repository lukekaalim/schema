// @flow strict
/*:: import type { Schema, IdSchema } from '../main'; */
const { flattenSchema } = require('./utils');

/*::
// Don't bother typing all of JSON Schema here
opaque type FlowSyntax: string = string;
*/

const getTabLineDepth = (depth) => {
  let depthPrefix = '';
  for (let i = 0; i < depth; i++) {
    depthPrefix += '  ';
  }
  return depthPrefix;
};

const toFlowExpression = (schema/*: Schema*/, depth/*: number*/ = 0)/*: FlowSyntax*/ => {
  switch (schema.type) {
    // primitive
    case 'string':
      return "string";
    case 'boolean':
      return "boolean";
    case 'number':
      return "number";
    case 'null':
      return "null";
    // compound
    case 'array':
      return `(${toFlowExpression(schema.elementSchema, depth)})[]`;
    case 'object':
      return [
        `{`,
          schema.propertySchemas
          .map(([property, schema]) => [
            getTabLineDepth(depth + 1),
            property,
            ': ',
            toFlowExpression(schema, depth + 1),
            ','
          ].join(''))
          .join('\n'),
          getTabLineDepth(depth) + `}`
      ].join('\n');
    // branch
    case 'union':
      return '\n' + schema.options
        .map(option => [
            getTabLineDepth(depth + 1),
            '| ',
            toFlowExpression(option, depth + 1),
          ].join('')
        )
        .join('\n');
    case 'optional':
      return ['null | (', toFlowExpression(schema.option, depth) , ')'].join('');
    case 'number-literal':
    case 'boolean-literal':
      return schema.literalValue.toString();
    case 'string-literal':
      return ['"', schema.literalValue.toString(), '"'].join('');
    case 'tuple':
      return [
        '[',
        schema.tupleSchemas.map(schema => toFlowExpression(schema, depth)).join(', ') ,
        ']'
      ].join('');
    // meta
    case 'name':
      return [
        toFlowExpression(schema.namedSchema, depth),
        '\t// ',
        schema.name,
        ': ',
        schema.description
      ].filter(Boolean).join('') + '\n' + getTabLineDepth(depth);
    case 'id':
      return schema.id;
    default:
      (schema/*: empty*/)
      throw new Error('Unimplemented');
  }
};

const toTypeDeclarationStatement = (schema/*: IdSchema*/) => {
  const { identifiedSchema, id } = schema;
  if (identifiedSchema.type === 'name')
    return [
      identifiedSchema.name && '// ' + identifiedSchema.name,
      identifiedSchema.description && '// ' + identifiedSchema.description,
      `type ${id} = ${toFlowExpression(identifiedSchema.namedSchema, 0)};`,
    ].filter(Boolean).join('\n');
  else
    return `type ${schema.id} = ${toFlowExpression(schema.identifiedSchema, 0)};`;
};

const toExportStatement = (schemasToExport/*: IdSchema[]*/) => {
  return [
    'export type {',
    ...schemasToExport.map(schema => getTabLineDepth(1) + schema.id + ','),
    '};',
  ].join('\n');
}

const toFlowDocument = (exportedSchemas/*: IdSchema[]*/) => {
  const dependantTypes = [...new Set(exportedSchemas
    .map(schema => flattenSchema(schema))
    .flat(1)
    .map(schema => schema.type === 'id' ? schema : null)
    .filter(Boolean)
    .filter(schema => !exportedSchemas.includes(schema)))];
  
  return [
    '// @flow strict',
    '// This document was autogenerated by @lukekaalim/schema',
    '',
    '/*::',
    ...dependantTypes.map(schema => toTypeDeclarationStatement(schema)),
    '',
    ...exportedSchemas.map(schema => toTypeDeclarationStatement(schema)),
    '',
    toExportStatement(exportedSchemas),
    '*/'
  ].join('\n');
};

module.exports = {
  toFlowExpression,
  toTypeDeclarationStatement,
  toExportStatement,
  toFlowDocument,
};