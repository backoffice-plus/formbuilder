import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../models";

export const prepareOptionData = (schema:JsonSchema, uischema:UISchemaElement) : Record<string, any> => {
    return {rule:uischema.rule};
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {
    uischema.rule = data.rule;
}

export const schema = {
    definitions: {
        rule: {
            type: 'object',
            properties: {
                rule: {
                    type: 'object',
                    properties: {
                        effect: {type:'string',enum:['SHOW','HIDE','ENABLE','DISABLE']},
                        condition: {
                            title: "ConditionType",
                            oneOf: [
                                {$ref: '#/definitions/rule/properties/ruleCondition',title:'SingleCondition'},
                                {$ref: '#/definitions/rule/properties/ruleConditions',title:'CombinedConditions'}
                            ]
                        }
                    }
                },
                ruleCondition: {
                    type: 'object',
                    properties: {
                        scope: {type:'string'},
                        schema: {
                            type: 'object',
                            properties: {
                                //const: {type:['string','number','boolean']}
                                const: {
                                    oneOf: [
                                        {type:'string',title:'string'},
                                        {type:'number',title:'number'},
                                        {type:'boolean',title:'boolean'},
                                    ]
                                }
                            }

                            // oneOf: [
                            //     {$ref:'#/definitions/ruleConditionSchemaConst',title:'Const'},
                            //     // {$ref:'#/definitions/ruleConditionSchemaConstString',title:'String'},
                            //     // {$ref:'#/definitions/ruleConditionSchemaConstNumber',title:'Number'},
                            //     // {$ref:'#/definitions/ruleConditionSchemaConstBoolean',title:'Boolean'},
                            // ]
                        }
                    }
                },
                ruleConditions: {
                    type: 'object',
                    properties: {
                        type: {type:'string',enum:['AND','OR']},
                        conditions: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                // $ref: '#/definitions/ruleCondition'

                                //$ref not working?!?!?!
                                type: 'object',
                                properties: {
                                    scope: {type:'string'},
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            const: {type:'string'}
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
                ruleConditionSchemaConst: {
                    type: 'object',
                    properties: { const: {type:['string','number','boolean']} }
                },
                // ruleConditionSchemaConstString: {
                //     type: 'object',
                //     properties: { const: {type:'string'} }
                // },
                // ruleConditionSchemaConstNumber: {
                //     type: 'object',
                //     properties: { const: {type:'number'} }
                // },
                // ruleConditionSchemaConstBoolean: {
                //     type: 'object',
                //     properties: { const: {type:'boolean'} }
                // },

            }
        }

    },
    "type": "object",
    "properties": {
        rule: {
            type: "object",
            $ref:'#/definitions/rule/properties/rule'
        },

        ruleOLD: {
            type: "object",
            properties: {
                effect: {
                    type: "string",
                    enum: ['HIDE','SHOW','DISABLE','ENABLE']
                },
                condition: {
                    type: "object",
                    properties: {
                        // scope: {
                        //     type: "string",
                        //     description: "like \"#/properties/name\""
                        // },
                        //"schema": { const: true }
                        //"schema": { const: 1 }
                        //"schema": { const: "sometext" }
                        //"schema": { enum: ["radio"] }

                        _scopePropertyName: {
                            type: "string",
                        },
                        _schema: {
                            type: "string",
                            enum: ['const', 'enum']
                        },
                        _schemaConstType: {
                            type: "string",
                            enum: ['string', 'number', 'boolean'],
                        },
                        _schemaConstAsString: {type:'string'},
                        _schemaConstAsNumber: {type:'number'},
                        _schemaConstAsBoolean: {type:'boolean'},
                        schema: {
                            type: "object",
                            properties: {
                                //_constAsNumber: {type:'number'},
                                // const: {
                                //     type: ['number', 'string', 'boolean'],
                                // },
                                // enum: {
                                //     type: "array",
                                // },
                            },
                        },
                    }
                },
            }
        },
    },
}

export const uischema = {

    "scope": "#/properties/rule",
    "type": "Control",

        //     "type": "VerticalLayout",
        //     "elements": [
        //         {
        //             "scope": "#/properties/rule/properties/effect",
        //             "type": "Control"
        //         },
        //         {
        //             "scope": "#/properties/rule/properties/condition/properties/_scopePropertyName",
        //             "type": "Control",
        //             label: 'Property Name',
        //         },
        //         {
        //             type: "Group",
        //             label: "Schema based condition",
        //             elements: [
        //
        //                 {
        //                     type: "HorizontalLayout",
        //                     elements: [
        //                         {
        //                             type: "Control",
        //                             label: "Schema Type",
        //                             scope: "#/properties/rule/properties/condition/properties/_schema"
        //                         },
        //                         {
        //                             type: "Control",
        //                             label: "Const Type",
        //                             scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
        //                             rule: {
        //                                 effect: "ENABLE",
        //                                 condition: {
        //                                     scope: "#/properties/rule/properties/condition/properties/_schema",
        //                                     schema: { const: "const" }
        //                                 }
        //                             }
        //                         },
        //                     ],
        //                 },
        //                 {
        //                     scope: "#/properties/rule/properties/condition/properties/_schemaConstAsString",
        //                     type: "Control",
        //                     rule: {
        //                         effect: "SHOW",
        //                         condition: {
        //                             scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
        //                             //schema: { enum: ["string"] }
        //                             schema: { const: "string" }
        //                         }
        //                     }
        //                 },
        //                 {
        //                     scope: "#/properties/rule/properties/condition/properties/_schemaConstAsNumber",
        //                     type: "Control",
        //                     rule: {
        //                         effect: "SHOW",
        //                         condition: {
        //                             scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
        //                             //schema: { enum: ["string"] }
        //                             schema: { const: "number" }
        //                         }
        //                     }
        //                 },
        //                 {
        //                     scope: "#/properties/rule/properties/condition/properties/_schemaConstAsBoolean",
        //                     type: "Control",
        //                     rule: {
        //                         effect: "SHOW",
        //                         condition: {
        //                             scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
        //                             schema: { const: "boolean" }
        //                         }
        //                     }
        //                 },
        //
        //             ]
        //         },
        //     ],
        // },
}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;
