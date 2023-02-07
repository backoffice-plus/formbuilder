import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: 'object',
    // definitions: {
    //     itemsWithType: {
    //         title: 'items.type',
    //         type: 'object',
    //         properties: {
    //             type: {type: 'string', enum: ['string', 'object']},
    //         },
    //         required: ["type"],
    //     },
    //     itemsByRef: {
    //         title: 'items.$ref',
    //         type: 'object',
    //         properties: {
    //             _reference: {type: 'string'},
    //         },
    //         required: ["_reference"],
    //     }
    // },
    properties: {
        propertyName: {
            type: "string"
        },
        singleChild: {
            type: "boolean"
        },
        // items: {
        //     type: 'object',
        //     title: 'Schema',
        //     oneOf: [
        //         {$ref: '#/definitions/itemsWithType'},
        //         {$ref: '#/definitions/itemsByRef'}
        //     ],
        // },
        options: {
            type: "object",
            properties: {
                elementLabelProp: {
                    type: "string"
                },
            }
        },
    },

} as JsonSchema;

export const uischema = {

    type: "Categorization",
    elements: [
        {
            type: "Category",
            label: "Base",
            elements: [
                {
                    type: "VerticalLayout",
                    elements: [
                        {
                            scope: "#/properties/propertyName",
                            type: "Control"
                        },
                        {
                            scope: "#/properties/singleChild",
                            type: "Control"
                        },
                        {
                            scope: "#/properties/options/properties/elementLabelProp",
                            type: "Control",
                        },
                        // {
                        //     type: "Group",
                        //     label: "Items",
                        //     elements: [
                        //         {
                        //             scope: "#/properties/items",
                        //             type: "Control",
                        //         },
                        //     ],
                        // },
                    ],
                }
            ]
        },
    ]
} as Categorization | UISchemaElement;

