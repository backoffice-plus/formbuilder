import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/personalbogen.form.json'

registerExamples([
  {
    name: "fb.personalbogen",
    label: "FormBuilder - personalbogen",
    ...jsonForms
  }
]);
