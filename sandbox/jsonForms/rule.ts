const schema = {
  "properties": {
    "checkbox": {
      "type": "boolean"
    },
    "file1": {
      "customType": "file",
      "type": "string"
    },
    "radio1": {
      "enum": [
        "entry"
      ],
      "type": "string"
    },
    "select1": {
      "oneOf": [
        {
          "const": "first",
          "title": "Erster Eintrag"
        },
        {
          "const": "second",
          "title": "Zweiter Eintrag"
        }
      ],
      "type": "string"
    }
  },
  "type": "object"
}

const uischema = {
  "elements": [
    {
      "elements": [
        {
          "label": "select",
          "scope": "#/properties/select1",
          "type": "Control"
        },
        {
          "label": "radio",
          "options": {
            "format": "radio"
          },
          "scope": "#/properties/radio1",
          "type": "Control"
        }
      ],
      "type": "HorizontalLayout"
    },
    {
      "elements": [
        {
          "label": "checkbox",
          "scope": "#/properties/checkbox",
          "type": "Control"
        },
        {
          "label": "file",
          "rule": {
            "condition": {
              "schema": {
                "const": true
              },
              "scope": "#/properties/checkbox"
            },
            "effect": "ENABLE"
          },
          "scope": "#/properties/file1",
          "type": "Control"
        }
      ],
      "type": "HorizontalLayout"
    }
  ],
  "type": "VerticalLayout"
}

export default {schema:schema,uischema:uischema,data: {}};
