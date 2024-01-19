import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
    type: "object",

    properties: {

        // stringOrBoolean: {
        //     oneOf: [
        //         {type:"string",title:"string"},
        //         {type:"boolean","title":"boolean"},
        //     ],
        //    // type: ["string", "boolean"],
        // },

        // user: {
        //   type:"object",
        //   properties: {
        //     name: {type:"string"}
        //   }
        // },

        //nested addProps
        options: {
            type: "object",


            // properties: {
            //      // first: {type:"string"},
            //     muchMore: {
            //         type: "object",
            //         additionalProperties: {
            //             type: "string",
            //         },
            //     }
            // },


            additionalProperties: {
              //type: ["string","boolean"], //validation correct, but renderer broken!!!
                oneOf: [
                    {type:"string","title":"string"},
                    {type:"boolean","title":"boolean"},
                    {type:"number","title":"number"},
                    {type:"array",items:{type:"string"},"title":"array of strings"},
                    {type:"array",items:{type:"number"},"title":"array of number"},
                ],
            },
            // "patternProperties": {
            //     "^age$": { "type": "number" },
            //     "^isOn$": { "type": "boolean" },
            // }

        }
    },

    // additionalProperties: {
    //   type: "string",
    //   title: "Additional Properties - ROOT"
    // },

    // patternProperties: {},
    // maxProperties:6,
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
      //"fromData": "yes",

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
