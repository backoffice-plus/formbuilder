export const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
        scalarOrObject: {
            oneOf: [
                {
                    $ref: "#/definitions/scalar",
                    title: "scalar",
                },
                {
                    $ref: "#/definitions/object",
                    title: "object",
                }
            ]
        },
        scalar: {
            type: "object",
            properties: {
                _key: {
                    type: "string"
                },
                type: {
                    type: "string",
                    enum: ["string", "number", "boolean"],
                    default: "string"
                },
            }
        },
        object: {
            type: "object",
            properties: {
                _key: {
                    type: "string"
                },
                properties: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/scalarOrObject"
                    }
                }
            }
        },
    },
    type: "object",
    properties: {
        root: {
            type: "array",
            items: {
                $ref: "#/definitions/scalarOrObject"
            }
        }
    }
};

export const uischema = null as any;

export const jsonForms = {schema:schema, uischema:uischema};
