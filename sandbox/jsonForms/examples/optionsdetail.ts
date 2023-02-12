import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  definitions: {
    message: {
      type: "string"
    },
    nameAndMessage: {
      type: "object",
      properties: {
        message: {
          type: "string"
        },
        name: {
          type: "string"
        }
      }
    }
  },
  properties: {
    name: {
      type: "string"
    },
    number: {
      type: "number"
    },
    comments: {
      type: "array",
      items: {
        $ref: "#/definitions/nameAndMessage",
      }
    },
    page: {
      type: 'object',
      properties: {
        comments: {
          type: "array",
          items: {
            $ref: "#/definitions/nameAndMessage",
          }
        },
      }
    },
    commentsAsStr: {
      type: "array",
      items: {
        type: "string"
      }
    },

    commentsAsStrOrObj: {
       oneOf: [
         {
           type: "array",
           title: "as str",
           items: {
             type: 'string'
           }
         },
         {
           type: "array",
           title: "as obj",
           items: {
             type: "object",
             properties: {
               message: {
                 type: "string"
               },
               id: {
                 type: "integer"
               }
             },
             required: ['message']
           }
         },
       ]
    },
  }
}

const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/page/properties/comments",
      options: {
        elementLabelProp: "message",
        detail: {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Label",
              text: "Your comment"
            },
            {
              type: "Control",
              scope: "#/properties/name"
            },
            {
              type: "Control",
              scope: "#/properties/message",
              options: {
                multi:true
              }
            },
          ]
        }
      }
    },
    {
      type: "Control",
      scope: "#/properties/name"
    },
  ]
}
const uischemaAsStr = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/commentsAsStr",
      options: {
        detail: {

          type: "Control",
          scope: "#",
          options: {
            multi:true
          }

          // type: "HorizontalLayout",
          // elements: [
          //   {
          //     type: "Control",
          //     scope: "#",
          //     options: {
          //       multi:true
          //     }
          //   },
          // ]
        }
      }
    }
  ]
}
const uischemaNoDetails = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/comments",
    }
  ]
}

const uischemaAnyOf = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/commentsAsStrOrObj",
      options: {
        detail: {

          type: "Control",
          scope: "#",
          options: {
            detail: {
              type: "VerticalLayout",
              elements: [

                {
                  type: "VerticalLayout",
                  scope: "#",
                  elements: [
                    {
                      type: "Control",
                      scope: "#",
                      options: {
                        multi:true
                      }
                    },
                  ],
                  rule: {
                    effect: "SHOW",
                    condition: {
                      scope: "#",
                      schema: { type: "string",}
                    }
                  }
                },

                {
                  type: "VerticalLayout",
                  scope: "#",
                  elements: [
                    {
                      type: "Control",
                      scope: "#/properties/id"
                    },
                    {
                      type: "Control",
                      scope: "#/properties/message",
                      options: {
                        multi:true
                      }
                    },
                  ],
                  rule: {
                    effect: "SHOW",
                    condition: {
                      scope: "#/items",
                      schema: { type: "object",}
                    }
                  }
                },
              ]
            }
          }
        }
      }
    }
  ]
}

/**
 id : "#"
 label : "as obj"
 path : "commentsAsStrOrObj"


 id : "#/properties/message"
 label : "Message"
 path : "commentsAsStrOrObj.message"


 */

export const data = {};

registerExamples([
  {
    name: 'options.detail',
    label: 'FormBuilder - options.detail',
    schema: schema,
    uischema: uischema,
    data: data,
  }
]);

registerExamples([
  {
    name: 'options.detail.nodetails',
    label: 'FormBuilder - options.detail (no options.detail)',
    schema: schema,
    uischema: uischemaNoDetails,
    data: data,
  }
]);


registerExamples([
  {
    name: 'options.detail.asstr',
    label: 'FormBuilder - options.detail (as str)',
    schema: schema,
    uischema: uischemaAsStr,
    data: data,
  }
]);

registerExamples([
  {
    name: 'options.detail.anyOf',
    label: 'FormBuilder - options.detail (anyOf)',
    schema: schema,
    uischema: uischemaAnyOf,
    data: data,
  }
]);
