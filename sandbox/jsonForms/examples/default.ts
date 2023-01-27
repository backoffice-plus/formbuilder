import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  $id: "http://localhost:5173/schemas/customer",

  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 3,
      //"description": "Please enter your name",
      "i18n": "nameI18n"
    },
    address: {
      $ref: '/schemas/address'
    }
  },
};

const uischema = {
  "type": "HorizontalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/name",
      "label": "name",
      //"i18n": "customName",
      "options": {
        "placeholder": "Your Name",
      }
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
    uischema
  }
]);
