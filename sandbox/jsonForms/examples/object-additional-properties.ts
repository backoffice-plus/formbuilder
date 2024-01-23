import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
    "type": "object",
    "properties": {

        "objectString": {
            "type": "object",
            "title": "with type string",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "additionalProperties": {
                "type": "string"
            }
        },

        "objectTypes": {
            "type": "object",
            "title": "with type array",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "additionalProperties": {
                "type": ["string","boolean"]
            }
        },

        "objectOneOf": {
            "type": "object",
            "title": "with oneOf",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "additionalProperties": {
                "oneOf": [
                    {"type":"string","title":"string"},
                    {"type":"boolean","title":"boolean"},
                    {"type":"number","title":"number"}
                ]
            }
        },

        "objectPattern": {
            "type": "object",
            "title": "with patternProperties: ^S_ ^I_ ^B_",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "additionalProperties": true,
            "patternProperties": {
                "^S_": {"type":"string"},
                "^I_": {"type":"integer"},
                "^N_": {"type":"number"},
                "^B_": {"type":"boolean"}
            }
        }
    }
}


const uischema = {
    type: "VerticalLayout",
    elements: [
        // {
        //   type: "Control",
        //   scope: "user/name",
        // },
        {
            type: "Control",
            scope: "#",
        },
    ]
}


export const data = {
    options: {

       // "name": "Dave",
        // "age": 23,
        // "isActive": true,
        // "colors": ["red", "blue"],
        // "ids": [12, 34],

    },
    // a:1,
    // fooA: "foobarA",
    // //nameA: "nameA",
    // types: {
    //   fooB:'foobarB',
    //   //nameB:'nameB',
    // }
};

registerExamples([
    {
        name: "fb.object.addprops",
        label: "FormBuilder - Object with additionalProperties",
        data,
        schema,
        uischema
    }
]);
