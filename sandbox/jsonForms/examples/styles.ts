import {registerExamples} from "@jsonforms/examples/src/register";
import jsonForms from './json/styles.form.json'
import jsonFormsLayout from './json/stylesLayout.form.json'

/**
 * @see https://github.com/eclipsesource/jsonforms/blob/master/packages/vue/vue-vanilla/src/styles/defaultStyles.ts
 * @see https://github.com/eclipsesource/jsonforms/blob/master/packages/vanilla-renderers/Styles.md
 */

registerExamples([
  {
    name: 'fb.styles',
    label: 'FormBuilder - styles',
    schema: jsonForms.schema,
    uischema: jsonForms.uischema,
    data: jsonForms.data,
  }
]);

registerExamples([
  {
    name: 'fb.styles.more',
    label: 'FormBuilder - styles Layout',
    schema: jsonFormsLayout.schema,
    uischema: jsonFormsLayout.uischema,
    data: jsonFormsLayout.data,
  }
]);
