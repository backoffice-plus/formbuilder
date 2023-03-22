import {registerExamples} from "@jsonforms/examples/src/register";
import constJsonForms from '../../../src/lib/tools/schema/const.form.json'
import constPartJsonForms from '../../../src/lib/tools/schema/subschemas/const.form.json'

registerExamples([
  {
    name: 'fb.option.const',
    label: 'FormBuilder - Option: Const',
    schema: constJsonForms.schema,
    uischema: constJsonForms.uischema,
    data: constJsonForms.data,
  }
]);

registerExamples([
  {
    name: 'fb.option.subschema.const',
    label: 'FormBuilder - Option - Subschema: Const',
    schema: constPartJsonForms.schema,
    uischema: constPartJsonForms.uischema,
    data: constPartJsonForms.data,
  }
]);
