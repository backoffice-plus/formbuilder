import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  type: "object",

  properties: {
    //nameA: { type: "string" },

    //nested addProps
    types: {
      type: "object",
      properties: {
        //nameB: {type: "string"},
      },
      additionalProperties: {
        type: "string"
      },
      //patternProperties: {},
    }
  },

  additionalProperties: {
    type: "string"
  },
  // patternProperties: {},
  // maxProperties:6,
}


const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#",
      // options: {
      //   restrict: true
      // }
    },
  ]
}


export const data = {
  fooA: "foobarA",
  //nameA: "nameA",
  types: {
    fooB:'foobarB',
    //nameB:'nameB',
  }
};

registerExamples([
  {
    name: "fb.object.addprops",
    label: "FormBuilder - Object with additionalProperties",
    data,
    schema,
    uischema
  }
]);
