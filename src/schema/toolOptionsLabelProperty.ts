export const schema = {
    "type": "object",
    "properties": {
        "label": {
            "type": "string"
        },
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
                            "scope": "#/properties/label",
                            "type": "Control"
                        },
                    ],

                }
            ]
        },

    ]
}

export const jsonForms = {schema:schema, uischema:uischema};
