import {registerExamples} from "@jsonforms/examples/src/register";

const schema = {
  type: "object",

  properties: {

    /**
     * its NOT working for nested object
     */
    //nested addProps
    // moreParams: {
    //   type: "object",
    //   additionalProperties: {
    //     type: "string",
    //   },
    // }
  },

  /**
   * its working for "root" object
   */
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
    },
  ]
}


export const data = {
  // moreParams: {
  //   "myFooBar": "Hello",
  // },
 // a:1,
  // fooA: "foobarA",
  // //nameA: "nameA",
  // types: {
  //   fooB:'foobarB',
  //   //nameB:'nameB',
  // }
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
