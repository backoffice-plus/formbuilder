import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/conditional.form.json'
import conditionalObjInArray from './json/conditionalObjInArray.form.json'

registerExamples([
  {
    name: "fb.conditional",
    label: "FormBuilder - conditional",
    ...jsonForms
  }
]);

registerExamples([
  {
    name: "fb.conditional.arrayofobj",
    label: "FormBuilder - conditional - Array of Objects",
    ...conditionalObjInArray
  }
]);
