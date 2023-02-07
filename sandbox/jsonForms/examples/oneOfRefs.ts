import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
  "definitions": {
    "address": {
      "type": "object",
      "title": "Address",
      "properties": {
        "street": {
          "type": "string"
        },
        "city": {
          "type": "string"
        }
      },
      required: ["street"],
    },
    "user": {
      "type": "object",
      "title": "User",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      required: ["name"],
    }
  },
  "type": "object",
  "properties": {
    "addressOrUser": {
      "oneOf": [
        {
          "$ref": "#/definitions/address"
        },
        {
          "$ref": "#/definitions/user"
        }
      ]
    }
  }
};

export const uischema = {
    type: 'HorizontalLayout',
    elements: [
      {
        type: 'Control',
        scope: "#/properties/addressOrUser"
      }
    ]
};

export const data = {
  addressOrUser: {
    name: "My Name",
  }
};

registerExamples([
  {
    name: 'oneOfRefs',
    label: 'FormBuilder - oneOfRefs',
    data,
    schema,
    uischema
  }
]);
