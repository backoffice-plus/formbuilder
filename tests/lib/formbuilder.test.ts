import { expect, test } from 'vitest'
import {getAllSubpaths, getRequiredFromSchema, getRequiredPath, setRequiredToSchema} from '../../src'
import {
    normalizeScope,
    normalizePath,
    denormalizePath,
    denormalizeScope,
    normalizeRule,
    denormalizeRule,
    normalizeDefinitions,
    denormalizeDefinitions,
    getBasePath,
    fromPropertyToBasePath,
    getPlainProperty
} from "../../src/lib/normalizer";
import type {Rule, SchemaBasedCondition} from "@jsonforms/core";
import {JsonSchema} from "@jsonforms/core";
import _ from "lodash";

test('normalizeScope', () => {
    const scope = '#/properties/name'
    const path = normalizeScope(scope)
    const prop = normalizePath(path)
    expect(path).toBe('properties.name')
    expect(prop).toBe('name')
})

test('normalizeScope nested', () => {
    const scope = '#/properties/personal/properties/age'
    const path = normalizeScope(scope)
    const prop = normalizePath(path)
    expect(path).toBe('properties.personal.properties.age')
    expect(prop).toBe('personal.age')
})

test('denormalizeScope', () => {
    const prop = 'name'
    const path = denormalizePath(prop)
    const scope = denormalizeScope(path)
    expect(path).toBe('properties.name')
    expect(scope).toBe('#/properties/name')
})

test('denormalizeScope nested', () => {
    const prop = 'personal.age'
    const path = denormalizePath(prop)
    const scope = denormalizeScope(path)
    expect(path).toBe('properties.personal.properties.age')
    expect(scope).toBe('#/properties/personal/properties/age')
})

test('buildAllSubpaths', () => {
    const prop = 'data.personal.age'
    const subparts = getAllSubpaths(prop)
    expect(subparts).toEqual(['data', 'data.personal','data.personal.age'])
})
test('buildAllSubpaths index1', () => {
    const prop = 'data.personal.age'
    const subparts = getAllSubpaths(prop, 1)
    expect(subparts).toEqual(['data.personal','data.personal.age'])
})

test('normalizeDefinitions', () => {
    const normalized = normalizeDefinitions(definition)
    expect(normalized).toEqual(definitionNormalized)
})
test('denormalizeDefinitions', () => {
    const denormalized = denormalizeDefinitions(definitionNormalized)
    console.log(JSON.stringify(denormalized));
    expect(denormalized).toEqual(definition)
})

test('fromPropertyToBasePath', () => {
    const basePath = fromPropertyToBasePath('data.personal.age')
    expect(basePath).toEqual('properties.data.properties.personal')
})

test('getPlainProperty', () => {
    const plain = getPlainProperty('data.personal.age')
    expect(plain).toEqual('age')
})

test('getRequiredPath', () => {
    const value1 = getRequiredPath('name')
    expect(value1).toEqual('required')

    const value2 = getRequiredPath('data.personal.age')
    expect(value2).toEqual('properties.data.properties.personal.required')
})
test('getRequiredFromSchema', () => {
    const value = getRequiredFromSchema('data.personal.age', schema)
    expect(value).toEqual(['age'])
})
test('setRequiredToSchema', () => {
    setRequiredToSchema('data.personal.age', schema, true)
    expect(schema.properties.data.properties.personal.required).toEqual(['age'])

    setRequiredToSchema('data.personal.age', schema, false)
    expect(schema.properties.data.properties.personal?.required).toEqual(undefined)
})

const schema = {
    type: 'object',
    properties:{
        data:{
            type: 'object',
            properties:{
                personal: {
                    type: 'object',
                    properties:{
                        age: {
                            type: 'string'
                        }
                    },
                    required: ['age']
                }
            }
        }
    }
};

const definition = {
    address:{
        properties:{
            street:{type:'string'}
        }
    }
};
const definitionNormalized = [
    {
        _key:'address',
        properties:[
            {
                _key:'street',
                type:'string',
            }
        ]
    }
];

const ruleData = {
    effect: 'SHOW',
    condition: {
        scope: '#/properties/asd',
        schema: { const: true },
        _scopePropertyName: 'asd',
        _schema: 'const',
        _schemaConstType: 'boolean',
        _schemaConstAsBoolean: true
    },
};
const rule = {
    effect: 'SHOW',
    condition: {
        scope: '#/properties/asd',
        schema: {
            const: true
        }
    } as SchemaBasedCondition
} as Rule;

test('normalizeRule', () => {
    expect(normalizeRule(rule)).toEqual(ruleData)
})

test('denormalizeRule', () => {
    expect(denormalizeRule(ruleData)).toEqual(rule)
})
