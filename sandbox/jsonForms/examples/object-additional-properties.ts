import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
    type: "object",

    properties: {

        // user: {
        //   type:"object",
        //   properties: {
        //     name: {type:"string"}
        //   }
        // },

        //nested addProps
        more: {
            type: "object",


            properties: {
                //  first: {type:"string"},
                muchMore: {
                    type: "object",
                    additionalProperties: {
                        type: "string",
                        title: "Additional Properties - much More"
                    },
                }
            },

            // additionalProperties: {
            //   type: "string",
            //   title: "Additional Properties - More"
            // },
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
    // more: {
    //   "second": "111",
    // },
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
