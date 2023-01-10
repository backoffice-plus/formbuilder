const schema = {
  "properties": {
    "name": {
      "type": "number"
    },
    "number1": {
      "type": "number"
    },
    "text": {
      "type": "number"
    }
  },
  "type": "object"
}

const uischema = {
  "elements": [
    {
      "elements": [
        {
          "elements": [
            {
              "label": "Text",
              "scope": "#/properties/text",
              "type": "Control"
            },
            {
              "label": "Name",
              "scope": "#/properties/name",
              "type": "Control"
            }
          ],
          "type": "HorizontalLayout"
        }
      ],
      "label": "Meine neue Gruppe",
      "type": "Group"
    },
    {
      "elements": [
        {
          "label": "number",
          "scope": "#/properties/number1",
          "type": "Control"
        }
      ],
      "label": "Zweite Gruppe",
      "type": "Group"
    }
  ],
  "type": "VerticalLayout"
}

export default {schema:schema,uischema:uischema,data: {}};
