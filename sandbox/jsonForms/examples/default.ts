import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  //$id: "http://localhost:5173/schemas/customer",

  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 3,
      //"description": "Please enter your name",
      "i18n": "nameI18n"
    },
    address: {
      //$ref: '/schemas/address',
      //$ref: "http://localhost:5173/schemas/address",
      $ref: "https://json-schema.org/learn/examples/address.schema.json",
    }
  },
};

const uischema = {
  "type": "HorizontalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/name",
    },
    {
      "type": "Control",
      "scope": "#/properties/address",
    },
  ]
};


export const data = {};

registerExamples([
  {
    name: 'latestExample',
    label: 'FormBuilder - latest example',
    data,
    schema,
    undefined,//uischema
  }
]);
