import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  type: "object",

  properties: {
    name: {
      type: "string"
    },

    //nested addProps
    types: {
      type: "object",
      properties: {
        typeA: {
          type: "string"
        },
      },
      additionalProperties: {
        type: "string",
        title: "Additional Properties"
      },
      patternProperties: {},
    }

      // properties: {
      //   firstOne: {
      //     type: "string"
      //   },
      // },
      // propertyNames: {
      //   minLength: 4
      // },
      //maxProperties: 2,
      //minProperties: 2,

      // additionalProperties: {
      //   type: "string",
      //   title: "Additional Properties"
      // },
      //
      // patternProperties: {
      //   //   "^S_": { "type": "string" },
      //   //   "^I_": { "type": "integer" }
      //   //   // "^string$": {
      //   //   //   type: "string"
      //   //   // },
      //   //   // "^number$": {
      //   //   //   type: "number"
      //   //   // },
      //   //   // "^integer$": {
      //   //   //   type: "integer"
      //   //   // },
      //   //   "^O_": {
      //   //     type: "object",
      //   //     properties: {
      //   //       prop1: {
      //   //         type: "string"
      //   //       }
      //   //     },
      //   //     additionalProperties: {
      //   //       type: "string",
      //   //       title: "Additional Properties"
      //   //     },
      //   //   },
      //   //   // "^boolean$": {
      //   //   //   type: "boolean"
      //   //   // },
      //   //   // "^stringArray$": {
      //   //   //   type: "array",
      //   //   //   items: {
      //   //   //     type: "string"
      //   //   //   }
      //   //   // },
      //   //   // "^numberArray$": {
      //   //   //   type: "array",
      //   //   //   items: {
      //   //   //     type: "number"
      //   //   //   }
      //   //   // },
      //   //   // "^integerArray$": {
      //   //   //   type: "array",
      //   //   //   items: {
      //   //   //     type: "integer"
      //   //   //   }
      //   //   // },
      //   //   // "^objectArray$": {
      //   //   //   type: "array",
      //   //   //   items: {
      //   //   //     type: "object",
      //   //   //     properties: {
      //   //   //       prop1: {
      //   //   //         type: "string"
      //   //   //       }
      //   //   //     }
      //   //   //   }
      //   //   // },
      //   //   // "^booleanArray$": {
      //   //   //   type: "array",
      //   //   //   items: {
      //   //   //     type: "boolean"
      //   //   //   }
      //   //   // }
      // }
   // }
  },

  additionalProperties: {
    type: "string",
    title: "Additional Properties"
  },
  patternProperties: {},
  maxProperties:6,
}


const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#",
      // options: {
      //   restrict: true
      // }
    },
  ]
}


export const data = {
  foo: "foobar",
  lorem: "lorem ipsum"
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
