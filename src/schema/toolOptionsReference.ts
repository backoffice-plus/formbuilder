export const schema = {
    type: "object",
    properties: {
        propertyName: {
            type: "string"
        },
        _reference: {
            type: "string",
            title: "Reference",
            description: "#/definitions/NAME"
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
                    "scope": "#/properties/_reference",
                    "type": "Control",
                    "label": "Reference to Definitions",
                },
            ]
        },

    ]
}

export const jsonForms = {schema:schema, uischema:uischema};
