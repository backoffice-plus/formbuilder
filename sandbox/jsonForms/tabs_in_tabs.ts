const schema = {
  "properties": {
    "checkbox1": {
      "type": "boolean"
    },
    "text1": {
      "type": "number"
    },
    "text2": {
      "type": "string"
    },
    "textarea1": {
      "type": "string"
    }
  },
  "type": "object"
}

const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Categorization",
      "elements": [
        {
          "type": "Category",
          "elements": [
            {
              "type": "HorizontalLayout",
              "elements": [
                {
                  "label": "checkbox",
                  "scope": "#/properties/checkbox1",
                  "type": "Control"
                },
                {
                  "label": "text",
                  "scope": "#/properties/text2",
                  "type": "Control"
                }
              ]
            }
          ],
          "label": "Basics"
        },
        {
          "elements": [
            {
              "elements": [
                {
                  "elements": [
                    {
                      "elements": [
                        {
                          "label": "text",
                          "scope": "#/properties/text1",
                          "type": "Control"
                        }
                      ],
                      "label": "Text",
                      "type": "Category"
                    },
                    {
                      "elements": [
                        {
                          "label": "textarea",
                          "options": {
                            "multi": true
                          },
                          "scope": "#/properties/textarea1",
                          "type": "Control"
                        }
                      ],
                      "label": "Textarea",
                      "type": "Category"
                    }
                  ],
                  "type": "Categorization"
                }
              ],
              "label": "Mehr Text",
              "type": "Group"
            }
          ],
          "label": "Details",
          "type": "Category"
        }
      ],
    }
  ]
}

export default {schema:schema,uischema:uischema,data: {}};
