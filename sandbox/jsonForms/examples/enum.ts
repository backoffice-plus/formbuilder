import {registerExamples} from "@jsonforms/examples/src/register";
import {data} from "./default";

export const schema = {
  type: 'object',
  properties: {
    countryCode: {
      type: 'string',
      enum: ['DE', 'IT', 'JP']
    },
    countryName: {
      type: 'string',
      oneOf: [
        {const:'DE',title:'Germany'},
        {const:'IT',title:'Italy'},
        {const:'JP',title:'Japan'},
      ]
    },
  },
};

export const uischema = {
    type: 'HorizontalLayout',
    elements: [
      {
        type: 'Control',
        scope: '#/properties/countryCode'
      },
      {
        type: 'Control',
        scope: '#/properties/countryName'
      }
    ]
};

export const emptyUischema = {
  "type": "Control",
  "scope": "#"
};

registerExamples([
  {
    name: 'enumError',
    label: 'FormBuilder - Multiple Choice',
    data,
    schema,
    uischema
  }
]);
