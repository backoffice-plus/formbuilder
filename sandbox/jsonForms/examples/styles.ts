import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  "type": "object",
    "properties": {
  "text": {
    "type": "string",
        "title": "very large textarea",
        "description": "a very good description text"
  },
  "control5": {
    "const": true
  },
  "control4": {
    "type": "string",
        "enum": ["foobar"]
  },
  "control7": {
    "type": "array",
        "items": {
      "type": "object",
          "properties": {
        "control11": {
          "type": "string"
        }
      }
    }
  },
  "control9": {
    "type": "object",
        "properties": {
      "control10": {
        "type": "string"
      }
    }
  }
}
};

/**
 * @see https://github.com/eclipsesource/jsonforms/blob/master/packages/vue/vue-vanilla/src/styles/defaultStyles.ts
 * @see https://github.com/eclipsesource/jsonforms/blob/master/packages/vanilla-renderers/Styles.md
 */

const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Label",
      "text": "Styling Example",
      "options": {
        "styles": {
          "label": {
            "root": "label-element m-4 p-2 !bg-yellow-400 !text-4xl font-bold !text-lime-400"
          }
        }
      }
    },
    {
      "type": "Categorization",
      "elements": [
        {
          "type": "Category",
          "elements": [
            {
              "type": "Group",
              "elements": [
                {
                  "type": "Control",
                  "scope": "#/properties/text",
                  "options": {
                    "multi": true,
                    "showUnfocusedDescription": true,
                    "styles": {
                      "control": {
                        "label": "label font-bold !tracking-widest !text-xl",
                        "textarea": "text-area font-mono font-bold !text-2xl text-lg h-80 text-blue-500 !bg-blue-100",
                        "description": "description bg-black !text-white p-4"
                      }
                    }
                  }
                }
              ],
              "label": "a Group",
              "options": {
                "styles": {
                  "group": {
                    "root": "group !bg-yellow-200 rounded-lg",
                    "label": "group-label !bg-yellow-400 rounded-xl text-center font-bold",
                    "item": "group-item px-4"
                  }
                }
              }
            }
          ],
          "label": "Textarea",
        },
        {
          "type": "Category",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/control5",
              "options": {
                "styles": {
                  "control": {
                    "label": "label !text-red-500 !text-2xl !bg-yellow-300 block"
                  }
                }
              }
            },
            {
              "type": "Control",
              "scope": "#/properties/control4",
              "options": {
                "styles": {
                  "control": {
                    "label": "label !text-blue-500 !text-2xl"
                  }
                }
              }
            }
          ],
          "label": "Control"
        },
        {
          "type": "Category",
          "elements": [
            {
              "type": "Label",
              "text": "Array"
            },
            {
              "type": "Control",
              "scope": "#/properties/control7",
              "options": {
                "styles": {
                  "arrayList": {
                    "root": "array-list !bg-yellow-500/50 !text-blue-500",
                    "label": "array-list-label font-mono !text-2xl !text-green-500/50",
                    "noData": "array-list-no-data !bg-red-500 !text-white",
                  }
                }
              }
            },
            {
              "type": "Label",
              "text": "Object"
            },
            {
              "type": "Control",
              "scope": "#/properties/control9"
            }
          ],
          "label": "Array & Object"
        }
      ],
      "options": {
        "styles": {
          "categorization": {
            "root": "categorization p-2 border border-red-500 bg-red-50",
            "category": "tabs gap-10 !border-red-500",
            "panel": "panel border !border-red-500 p-4 bg-red-200/50",
            "selected": "selected !bg-red-800 !text-white",
          }
        }
      }
    }
  ],
  "options": {
    "styles": {
      "verticalLayout": {
        "root": "vertical-layout p-4 border-4 border-dotted border-blue-500 shadow-xl m-4 p-2"
      }
    }
  }
}


export const data = {
  text: 'lorem ipsum'
};

registerExamples([
  {
    name: 'fb.styles',
    label: 'FormBuilder - styles',
    data,
    schema,
    uischema,//uischema
  }
]);
