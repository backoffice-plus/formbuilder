import {registerExamples} from "@jsonforms/examples/src/register";
import {data} from "./default";

const schema = {
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "description": "Login Name"
    },
    "password": {
      "type": "string",
      "format": "password",
      "description": "Login password"
    }
  },
  "required": [
    "username",
    "password"
  ]
}

const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Label",
      "text": "Login Information"
    },
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Control",
          "scope": "#/properties/username"
        },
        {
          "type": "Control",
          "scope": "#/properties/password"
        }
      ]
    }
  ]
}
registerExamples([
  {
    name: 'login',
    label: 'FormBuilder - Login',
    data,
    schema,
    uischema
  }
]);
