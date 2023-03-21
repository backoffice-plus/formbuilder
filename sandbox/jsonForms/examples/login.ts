import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/login.form.json'

registerExamples([
  {
    name: 'fb.login',
    label: 'FormBuilder - Login',
    schema: jsonForms.schema,
    uischema: jsonForms.uischema,
    data: jsonForms.data,
  }
]);
