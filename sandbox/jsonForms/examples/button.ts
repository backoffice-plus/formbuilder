import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/const.form.json'

registerExamples([
  {
    name: 'fb.button',
    label: 'FormBuilder - button',
    schema: jsonForms.schema,
    uischema: jsonForms.uischema,
    data: jsonForms.data,
  }
]);
