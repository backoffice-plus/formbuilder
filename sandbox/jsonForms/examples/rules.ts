import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  "type": "object",
  "properties": {
    "askName": {
      "type": "boolean"
    },
    "name": {
      "type": "string"
    }
  }
}

const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Control",
          "scope": "#/properties/askName"
        },
        {
          "type": "Control",
          "scope": "#/properties/name",
          rule: {
              effect: "ENABLE",
              condition: {
                  scope: "#/properties/askName",
                  schema: { const: true }
              }
          }
        }
      ]
    }
  ]
}


export const data = {};

registerExamples([
  {
    name: 'formbuilderRules',
    label: 'FormBuilder - rules',
    data,
    schema,
    uischema
  }
]);
