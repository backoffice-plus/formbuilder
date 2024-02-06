import {registerExamples} from "@jsonforms/examples/src/register";
import jf from './json/composition.form.json'
import jf2 from './json/composition2.form.json'

registerExamples([
  {
    name: 'fb.composition',
    label: 'FormBuilder - Composition',
    schema: jf.schema,
    uischema: jf.uischema,
    data: jf.data,
  }
]);

registerExamples([
  {
    name: 'fb.composition2',
    label: 'FormBuilder - Composition 2',
    schema: jf2.schema,
    uischema: jf2.uischema,
    data: jf2.data,
  }
]);
