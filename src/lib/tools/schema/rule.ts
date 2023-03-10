import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../models";
import type {ToolContext} from "../index";
import _ from "lodash";

export const prepareOptionData = (context:ToolContext, schema:JsonSchema, uischema:UISchemaElement) : Record<string, any> => {
    const rule = uischema.rule;
    return {rule:{rule:rule}};
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

    const rule = data?.rule?.rule;

    uischema.rule = rule;

    if(_.isEmpty(uischema.rule)) {
        delete uischema.rule;
    }
}

export const schema = {

    type: "object",
    definitions: {
        schemaConstTypes: {
            oneOf: [
                {type:'string',title:'string'},
                {type:'number',title:'number'},
                {type:'boolean',title:'boolean'},
            ] ,
           // default:{type:'string'}
            //required:['type']
        },

        schema: {
            type: 'object',
            properties: {
                //const: {type:'string', enum:['string','number','boolean']                        }
                const: {
                    oneOf: [
                        {type:'string',title:'string'},
                        {type:'number',title:'number'},
                        {type:'boolean',title:'boolean'},
                    ]
                }
            },
            required:['const'],
        },

        ruleCondition: {
            type: 'object',
            title:'Single Condition',
            properties: {
                scope: {type:'string'},
               // schema: {$ref:'#/definitions/schema'},
                //schema: {allOf:[{$ref:'#/definitions/schema'}]},
                // schema: {
                //     type: 'object',
                //     properties: {
                //         //const: {type:'string', enum:['string','number','boolean']                        }
                //        // string: { type:'string' },
                //       //  typeString: {  $ref:'#/definitions/typeString' },
                //         typeNumber: {  $ref:'#/definitions/ruleCondition/definitions/typeNumber' },
                //         // const: {
                //         //     oneOf: [
                //         //         {type:'string',title:'string'},
                //         //         {type:'number',title:'number'},
                //         //         {type:'boolean',title:'boolean'},
                //         //     ]
                //         // }
                //     }
                //
                //     // oneOf: [
                //     //     {$ref:'#/definitions/ruleConditionSchemaConst',title:'Const'},
                //     //     // {$ref:'#/definitions/ruleConditionSchemaConstString',title:'String'},
                //     //     // {$ref:'#/definitions/ruleConditionSchemaConstNumber',title:'Number'},
                //     //     // {$ref:'#/definitions/ruleConditionSchemaConstBoolean',title:'Boolean'},
                //     // ]
                // }
                schema: {
                    type: 'object',
                    properties: {
                        const: {
                            oneOf: [
                                {type:'string',title:'string'},
                                {type:'number',title:'number'},
                                {type:'boolean',title:'boolean'},
                            ]
                        }
                    },
                    required:['const'],
                },
            },
            required: ['scope','schema']//
        },


        ruleConditions: {
            type: 'object',
            title:'Combined Conditions',
            properties: {
                type: {type:'string',enum:['AND','OR'],default:'AND'},
                conditions: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        //$ref: '#/definitions/ruleCondition'
                       // allOf: [{$ref: '#/definitions/ruleCondition'}]
                        //

                        type: 'object',
                        properties: {
                            scope: {type:'string',description:'like: #/properties/name'},
                            schema: {
                                type: 'object',
                                properties: {
                                   // const: {$ref:'#/definitions/schemaConstTypes'},
                                   // const: {anyOf: [{$ref: '#/definitions/schemaConstTypes'}]},
                                    const: {
                                        oneOf: [
                                            {type:'string',title:'string'},
                                            {type:'number',title:'number'},
                                            {type:'boolean',title:'boolean'},
                                        ]
                                    }
                                },
                              //  required:['const'],
                            },
                        }
                    }
                }
            },
            required: ['type']//,'conditions'
        },


        // rule: {
        //     type: 'object',
        //     properties: {
        //         rule: {
        //             type: 'object',
        //             properties: {
        //                 effect: {type:'string',enum:['SHOW','HIDE','ENABLE','DISABLE']},
        //                 condition: {
        //                     title: "ConditionType",
        //                     oneOf: [
        //                         {$ref: '#/definitions/ruleCondition'},
        //                         {$ref: '#/definitions/ruleConditions'}
        //                     ]
        //                 }
        //             }
        //         },
        //         ruleConditionSchemaConst: {
        //             type: 'object',
        //             properties: { const: {type:['string','number','boolean']} }
        //         },
        //         // ruleConditionSchemaConstString: {
        //         //     type: 'object',
        //         //     properties: { const: {type:'string'} }
        //         // },
        //         // ruleConditionSchemaConstNumber: {
        //         //     type: 'object',
        //         //     properties: { const: {type:'number'} }
        //         // },
        //         // ruleConditionSchemaConstBoolean: {
        //         //     type: 'object',
        //         //     properties: { const: {type:'boolean'} }
        //         // },
        //
        //     }
        // }

    },

    properties: {
        // rule: {
        //     type: "object",
        //     $ref:'#/definitions/rule/properties/rule'
        // },

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
                                {$ref: '#/definitions/ruleCondition',title:'SingleCondition'},
                                {$ref: '#/definitions/ruleConditions',title:'CombinedConditions'}
                            ]
                        }
                    },
                    required:['effect','condition']
                },
                // ruleConditionSchemaConst: {
                //     type: 'object',
                //     properties: { const: {type:['string','number','boolean']} }
                // },
            }
        },
    },
}

export const uischema = {

    "scope": "#/properties/rule/properties/rule",
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
