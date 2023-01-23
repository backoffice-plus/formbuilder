import { expect, test } from 'vitest'
import {
    normalizeScope, normalizePath,
    denormalizePath, denormalizeScope,
    getAllSubpaths,

    normalizeRule, denormalizeRule, normalizeDefinitions, denormalizeDefinitions
} from "../../src";
import type {Rule, SchemaBasedCondition} from "@jsonforms/core";

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
