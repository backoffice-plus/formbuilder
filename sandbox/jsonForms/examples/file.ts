import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/file.form.json'

registerExamples([
  {
    name: 'fb.file',
    label: 'FormBuilder - File',
    schema: jsonForms.schema,
    uischema: jsonForms.uischema,
    data: jsonForms.data,
  }
]);
