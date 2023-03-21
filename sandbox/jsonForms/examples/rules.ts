import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/rules.form.json'

registerExamples([
  {
    name: "fb.rules",
    label: "FormBuilder - rules",
    schema: jsonForms.schema,
    uischema: jsonForms.uischema,
    data: jsonForms.data,
  }
]);
