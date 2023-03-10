import {registerExamples} from "@jsonforms/examples/src/register";
import {schema, uischema} from "../../../src/lib/tools/schema/__deprecated/toolOptionsCombinatorWithRefs";

export const data = {};

registerExamples([
  {
    name: 'optionModalCombinator',
    label: 'FormBuilder - OptionModal Combinator',
    data,
    schema,
    uischema
  }
]);
