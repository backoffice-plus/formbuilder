import {registerExamples} from "@jsonforms/examples/src/register";
import {data} from "./default";

const schema = {
  "type": "object",
  "properties": {
    "foo": {
      "anyOf": [
        {"type": "string"},
        {
          "type": "string",
          "enum": [
            "foo",
            "bar"
          ]
        }
      ]
    }
  }
};

const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/foo"
    }
  ]
}

registerExamples([
  {
    name: 'fb.anyofsimple',
    label: 'FormBuilder - AnyOf Simple',
    data,
    schema,
    uischema
  }
]);
