import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  type: "object",
  properties: {
    boolean: {
      type: "boolean",
    },
    string: {
      type: "string",
    },
    integer: {
      type: "integer",
    },
    enum: {
      type: "string",
      enum: ["off","on","true","false"]
    },
    array: {
      type: "array",
      items: {
        type: "string"
      }
    },
    name: {
      type: "string"
    }
  }
}

const uischema = {
  type: "VerticalLayout",
  elements: [


    {
      type: "Group",
      label: "Boolean equals const",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/boolean",
              options: {
                toggle: true
              }
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#/properties/boolean",
                  schema: { const: true }
                }
              }
            }
          ]
        }
      ],
    },

    {
      type: "Group",
      label: "String equals const",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/string",
              label: "enter \"on\" to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#/properties/string",
                  schema: { const: "on" }
                }
              }
            }
          ]
        }
      ],
    },

    {
      type: "Group",
      label: "String equals enum",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/string",
              label: "enter \"on\" or \"true\" to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#/properties/string",
                  schema: { enum: ["on","true"] }
                }
              }
            }
          ]
        }
      ],
    },

    {
      type: "Group",
      label: "Enum equals const",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/enum",
              label: "select \"on\" to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#/properties/enum",
                  schema: { const: "on" }
                }
              }
            }
          ]
        }
      ],
    },

    {
      type: "Group",
      label: "String Pattern",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/string",
              label: "enter \"two letters followed by three numbers\" to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#",
                  schema: {
                    properties: {
                      string: {
                        pattern: "^\\w{2}\\d{3}"
                      }
                    },
                    required: ["string"]
                  }
                }
              }
            }
          ]
        }
      ],
    },


    {
      type: "Group",
      label: "String minLength",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/string",
              label: "enter at least 3 signs to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#",
                  schema: {
                    properties: {
                      string: { minLength: 3,   }
                    },
                    required: ["string"]
                  }
                }
              }
            }
          ]
        }
      ],
    },

    {
      type: "Group",
      label: "String not",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/enum",
              label: "select neither \"off\" nor \"false\" to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#",
                  schema: {
                    properties: {
                      enum: { not: {enum:["off","false"] } }
                    },
                    required: ["enum"]
                  }
                }
              }
            }
          ]
        }
      ],
    },

    {
      type: "Group",
      label: "Number Minimum & exclusiveMaximum",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/integer",
              label: "enter a number between 5 and 10 to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {

                  //not working if number is not isset
                  // scope: "#/properties/number",
                  // schema: { minimum: 5, exclusiveMaximum: 10 }

                  scope: "#",
                  schema: {
                    properties: {
                      integer: { minimum: 5, exclusiveMaximum: 10  }
                    },
                    required: ["integer"]
                  }
                }
              }
            }
          ]
        }
      ],
    },


    {
      type: "Group",
      label: "Array contains const",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/array",
              label: "create at least one entry with \"on\" to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#",
                  schema: {
                    properties: {
                      array: { contains: { const: "on"  }  }
                    },
                    required: ["array"]
                  }
                }
              }
            }
          ]
        }
      ],
    },


    {
      type: "Group",
      label: "Array minItems",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/array",
              label: "create at least 3 unique filled items to enable input field",
            },
            {
              type: "Label",
              text: "Rule was successful",
              rule: {
                effect: "SHOW",
                condition: {
                  scope: "#",
                  schema: {
                    properties: {
                      array: { minItems:3, uniqueItems:true, items:{minLength:1}  }
                    },
                    required: ["array"]
                  }
                }
              }
            }
          ]
        }
      ],
    },
  ]
}


export const data = {
  number:0,
};

registerExamples([
  {
    name: "formbuilderRules",
    label: "FormBuilder - rules",
    data,
    schema,
    uischema
  }
]);
