export const schema = {
    type: "object",
    properties: {
        propertyName: {
            type: "string"
        },
        keyword: {
            type: "string",
            enum: ['oneOf', 'anyOf', 'allOf'],
        }
    },
}

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
                    "scope": "#/properties/keyword",
                    "type": "Control"
                },
            ]
        },

    ]
}

export const jsonForms = {schema:schema, uischema:uischema};
