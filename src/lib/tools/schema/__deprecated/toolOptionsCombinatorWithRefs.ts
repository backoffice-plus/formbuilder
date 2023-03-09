export const schema = {
    type: "object",
    definitions: {
        refItem: {
            type: "object",
            properties: {
                _ref: {
                    type: "string",
                    title: "Reference",
                    description: "#/definitions/NAME"
                },
            }
        },
        refItems: {
            type: "array",
            items: {
                $ref: "#/definitions/refItem"
            },
        },
        refItemsAsAllOf: {
            properties: {
                allOf: {
                    $ref: "#/definitions/refItems"
                },
            },
            title: "References to Definition"
        },
        refItemsAsAnyOf: {
            properties: {
                anyOf: {
                    $ref: "#/definitions/refItems"
                },
            },
            title: "References to Definition"
        },
        refItemsAsOneOf: {
            properties: {
                oneOf: {
                    $ref: "#/definitions/refItems"
                },
            },
            title: "References to Definition"
        },
    },
    properties: {
        propertyName: {
            type: "string"
        },
        refOrRefs: {
            oneOf: [
                {
                    $ref: "#/definitions/refItem",
                    title: "Reference"
                },
                {
                    $ref: "#/definitions/refItemsAsAllOf",
                    title: "allOf References"
                },
                {
                    $ref: "#/definitions/refItemsAsAnyOf",
                    title: "anyOf References"
                },
                {
                    $ref: "#/definitions/refItemsAsOneOf",
                    title: "anyOf References"
                },
            ]
        }
    },
}

/**
 * "properties": {
 *     "XXX": {
 *       "$ref": "#/definitions/anyOf",
 *       "title": "References"
 *     }
 *     "YYY": {
 *       "anyOf": [
 *         {
 *           "$ref": "#/definitions/address"
 *         }
 *       ]
 *     }
 *     "YYY": {
 *       "allOf": [
 *         {
 *           "$ref": "#/definitions/address"
 *         }
 *       ]
 *     }
 *   }
 */
export const uischema = {

    "type": "Categorization",
    "elements": [
        {
            "type": "Category",
            "label": "Base",
            "elements": [
                {
                    "type": "HorizontalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/propertyName",
                            "type": "Control"
                        },
                    ],
                },
                {
                    "scope": "#/properties/refOrRefs",
                    "type": "Control",
                    "label": "References to Definitions",
                },
            ]
        },

    ]
}

export const jsonForms = {schema:schema, uischema:uischema};
