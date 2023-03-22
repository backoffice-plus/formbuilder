import {registerExamples} from "@jsonforms/examples/src/register";
import constJsonForms from '../../../src/lib/tools/schema/const.form.json'
import constPartJsonForms from '../../../src/lib/tools/schema/subschemas/const.form.json'
import stylesPartJsonForms from '../../../src/lib/tools/schema/subschemas/styles.form.json'
import validationSubschema from '../../../src/lib/tools/schema/subschemas/validation.form.json'
import labelSubschema from '../../../src/lib/tools/schema/subschemas/label.form.json'
import ruleSubschema from '../../../src/lib/tools/schema/subschemas/rule.form.json'

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

registerExamples([
  {
    name: 'fb.option.subschema.styles',
    label: 'FormBuilder - Option - Subschema: Style',
    schema: stylesPartJsonForms.schema,
    uischema: stylesPartJsonForms.uischema,
    data: stylesPartJsonForms.data,
  }
]);

registerExamples([
  {
    name: 'fb.option.subschema.validation',
    label: 'FormBuilder - Option - Subschema: Validation',
    schema: validationSubschema.schema,
    uischema: validationSubschema.uischema,
    data: validationSubschema.data,
  }
]);

registerExamples([
  {
    name: 'fb.option.subschema.label',
    label: 'FormBuilder - Option - Subschema: Label',
    schema: labelSubschema.schema,
    uischema: labelSubschema.uischema,
    data: labelSubschema.data,
  }
]);

registerExamples([
  {
    name: 'fb.option.subschema.rule',
    label: 'FormBuilder - Option - Subschema: Rule',
    schema: ruleSubschema.schema,
    uischema: ruleSubschema.uischema,
    data: ruleSubschema.data,
  }
]);
