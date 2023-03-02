export const schema = {
    type: "object",
    properties: {
        options: {
            type: "object",
            properties: {
                slider: {type: "boolean"},
                trim: {type: "boolean"},
            }
        }
    }
};

export const uischema = {
    type: 'Category',
    label: 'Vuetify',
    elements: [
        {
            scope: "#/properties/options/properties/slider",
            type: "Control",
            rule: {
                effect: "SHOW",
                condition: {
                    scope: "#/properties/type",
                    schema: {
                        enum: ["number", "integer"]
                    }
                }
            }
        },
        {
            scope: "#/properties/options/properties/trim",
            type: "Control",
            rule: {
                effect: "SHOW",
                condition: {
                    scope: "#/properties/type",
                    schema: {
                        const: "string"
                    }
                }
            }
        },
    ]
}
