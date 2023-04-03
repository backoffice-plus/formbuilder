import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/conditional.form.json'
import conditionalObjInArray from './json/conditionalObjInArray.form.json'
import conditionalNot from './json/conditionalNot.form.json'
import conditionalPattern from './json/conditionalPattern.form.json'

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

registerExamples([
  {
    name: "fb.conditional.not",
    label: "FormBuilder - conditional - Not",
    ...conditionalNot
  }
]);


registerExamples([
  {
    name: "fb.conditional.pattern",
    label: "FormBuilder - conditional - Pattern",
    ...conditionalPattern
  }
]);
