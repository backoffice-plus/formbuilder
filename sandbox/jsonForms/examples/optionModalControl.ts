import {registerExamples} from "@jsonforms/examples/src/register";
import {schema, uischema} from "../../../src/lib/tools/schema/__deprecated/toolOptionsControl";

export const data = {};

registerExamples([
  {
    name: 'optionModalControl',
    label: 'FormBuilder - OptionModal Control',
    data,
    schema,
    uischema
  }
]);
