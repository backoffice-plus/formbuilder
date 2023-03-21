import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/enum.form.json'

registerExamples([
  {
    name: 'fb.enum',
    label: 'FormBuilder - Multiple Choice',
    schema: jsonForms.schema,
    uischema: jsonForms.uischema,
    data: jsonForms.data,
  }
]);
