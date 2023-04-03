import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/definitions.form.json'

registerExamples([
  {
    name: "fb.definitions",
    label: "FormBuilder - definitions",
    ...jsonForms
  }
]);
