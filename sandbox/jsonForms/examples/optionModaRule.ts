import {registerExamples} from "@jsonforms/examples/src/register";
import {schema, uischema} from "../../../src/lib/tools/schema/subschemas/rule";

export const data = {};

registerExamples([
  {
    name: 'fb.om.rule',
    label: 'FormBuilder - OptionModal Rule',
    data,
    schema,
    uischema
  }
]);
