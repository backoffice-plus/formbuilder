import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  "type": "object",
  "properties": {
    "text": { "type": "string" },
    "boolean": { "type": "boolean" },
  }
}


const uischema = {
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Label",
      "text": "VerticalLayout with custom css class \"horizontalFirstChildOneQuarter\"",
      "options": {
        "styles": {
          "label": {
            "root": "!text-2xl !text-bold"
          }
        }
      }
    },
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Label",
          "text": "Effortlessly design visually appealing website layouts with our tool."
        },
        {
          "type": "Control",
          "scope": "#/properties/text"
        }
      ]
    },
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Label",
          "text": "You can get started on your design in no time and other design elements to your canvas and customize them to your liking.  Whether you're a seasoned designer or just starting out."
        },
        {
          "type": "VerticalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/text"
            },
            {
              "type": "Control",
              "scope": "#/properties/text",
              "options": {
                "multi": true
              }
            }
          ],
          "label": "Group"
        }
      ]
    },
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Label",
          "text": "With our drag and drop functionality, you can quickly add images, text boxes, and other design elements to your canvas and customize them to your liking. And with a variety of pre-built templates and layouts to choose from, you can get started on your design in no time."
        },
        {
          "type": "HorizontalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/text"
            },
            {
              "type": "Control",
              "scope": "#/properties/text",
              "options": {
                "multi": true
              }
            }
          ]
        }
      ]
    },
    {
      "type": "HorizontalLayout",
      "elements": [
        {
          "type": "Label",
          "text": "Our layout creation tool is the perfect solution for anyone looking to create stunning layouts for their projects with ease. Whether you're a seasoned designer or just starting out, our intuitive interface and powerful tools make it easy to arrange and showcase your content in a visually appealing way."
        },
        {
          "type": "HorizontalLayout",
          "elements": [
            {
              "type": "Control",
              "scope": "#/properties/text"
            },
            {
              "type": "Control",
              "scope": "#/properties/text",
              "options": {
                "multi": true
              }
            },
            {
              "type": "Control",
              "scope": "#/properties/text"
            }
          ]
        }
      ]
    }
  ],
  "options": {
    "styles": {
      "verticalLayout": {
        "root": "vertical-layout horizontalFirstChildOneQuarter"
      }
    }
  }
}


export const data = {

};

registerExamples([
  {
    name: 'fb.styles.layout',
    label: 'FormBuilder - styles layout',
    data,
    schema,
    uischema,//uischema
  }
]);
