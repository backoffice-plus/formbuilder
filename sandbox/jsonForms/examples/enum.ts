import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
  type: 'object',
  properties: {

    //single Select
    singleEnum: {
      type: 'string',
      enum: ['DE', 'IT', 'JP']
    },
    singleOneOf: {
      type: 'string',
      oneOf: [
        {const:'DE',title:'Germany'},
        {const:'IT',title:'Italy'},
        {const:'JP',title:'Japan'},
      ]
    },

    //Multi Select
    multiEnum: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: ['DE', 'IT', 'JP']
      }
    },
    oneOfMultiEnum: {
      type: 'array',
      uniqueItems: true,
      items: {
        oneOf: [
          {const:'DE',title:'Germany'},
          {const:'IT',title:'Italy'},
          {const:'JP',title:'Japan'},
        ]
      }
    }
  },
};

export const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Group",
      elements: [
        {
          type: "Group",
          elements: [
            {
              type: "HorizontalLayout",
              elements: [
                {
                  type: "Control",
                  scope: "#/properties/singleEnum",
                  label: "Enum"
                },
                {
                  type: "Control",
                  scope: "#/properties/singleOneOf",
                  label: "One Of"
                }
              ]
            }
          ],
          label: "Select"
        },
        {
          type: "Group",
          elements: [
            {
              type: "HorizontalLayout",
              elements: [
                {
                  type: "Control",
                  scope: "#/properties/singleEnum",
                  options: {
                    format: "radio"
                  },
                  label: "Enum as Radio Button"
                },
                {
                  type: "Control",
                  scope: "#/properties/singleOneOf",
                  options: {
                    format: "radio"
                  },
                  label: "oneOf Radio Button"
                }
              ]
            }
          ],
          label: "Radio Buttons"
        }
      ],
      label: "Single Select"
    },
    {
      type: "Group",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/multiEnum",
              label: "Enum"
            },
            {
              type: "Control",
              scope: "#/properties/oneOfMultiEnum",
              label: "One Of"
            }
          ]
        }
      ],
      label: "Multi Select"
    }
  ]
}

const data = {};

registerExamples([
  {
    name: 'enumError',
    label: 'FormBuilder - Multiple Choice',
    data,
    schema,
    uischema
  }
]);
