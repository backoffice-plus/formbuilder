import {registerExamples} from "@jsonforms/examples/src/register";
import category from '../../../src/lib/tools/schema/category.form.json'
import categorization from '../../../src/lib/tools/schema/categorization.form.json'
import combinator from '../../../src/lib/tools/schema/combinator.form.json'
import group from '../../../src/lib/tools/schema/group.form.json'
import label from '../../../src/lib/tools/schema/label.form.json'
import layout from '../../../src/lib/tools/schema/layout.form.json'
import object from '../../../src/lib/tools/schema/object.form.json'
import constPartJsonForms from '../../../src/lib/tools/schema/subschemas/const.form.json'
import stylesPartJsonForms from '../../../src/lib/tools/schema/subschemas/styles.form.json'
import validationSubschema from '../../../src/lib/tools/schema/subschemas/validation.form.json'
import ruleSubschema from '../../../src/lib/tools/schema/subschemas/rule.form.json'

const examples = [
  {name:"category", schema:category},
  {name:"categorization", schema:categorization},
  {name:"combinator", schema:combinator},
  {name:"group", schema:group},
  {name:"layout", schema:layout},
  {name:"object", schema:object},

    //:TODO
  // {name:"array", schema:array},
 // {name:"control", schema:control},
 // {name:"select", schema:select},
];

examples.forEach(item => {
  const {name,schema} = item;
  registerExamples([
    {
      name: 'fb.option.' + name,
      label: 'FormBuilder - Option: '+ name,
      ...schema
    }
  ]);
})



/**
 *
 * Subschemas
 *
 */

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
    name: 'fb.option.subschema.rule',
    label: 'FormBuilder - Option - Subschema: Rule',
    schema: ruleSubschema.schema,
    uischema: ruleSubschema.uischema,
    data: ruleSubschema.data,
  }
]);
