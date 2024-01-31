import validationSubschema from "../schema/subschemas/validation.form.json";
import labelSchema from "../schema/subschemas/label.schema.json";
import labelModeBoth from "../schema/subschemas/label.modeBoth.form.json";
import labelModeSchema from "../schema/subschemas/label.modeSchema.form.json";
import labelModeUi from "../schema/subschemas/label.modeUi.form.json";
//import stylesSubschema from "../schema/subschemas/styles.form.json";
import constSubschema from "../schema/subschemas/const.form.json";
import ruleSubschema from "../schema/subschemas/rule.form.json";
import conditionalSubschema from "../schema/subschemas/conditional.form.json";
import definitionsSubschema from "../schema/subschemas/definitions.form.json";
import operationSubschema from "../schema/subschemas/operation.form.json";
import uiOptionsSubschema from "../schema/subschemas/uioptions.form.json";
// @ts-ignore
import draft07 from '../schema/drafts/draft07.schema.json'
import jfUiRule from '../schema/drafts/jsonforms_ui_rule.schema.json'
import {uioptionsSchemaResolver} from "@/lib/tools/subschemas/uioptions";

export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './labelAndI18n'
export { prepareOptionData as prepareOptionDataValidation, setOptionData as setOptionDataValidation } from './validation'
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'
//export { prepareOptionData as prepareOptionDataStyles, setOptionData as setOptionDataStyles } from './styles'
export { prepareOptionData as prepareOptionDataConst, setOptionData as setOptionDataConst } from './const'
export { prepareOptionData as prepareOptionDataconditional, setOptionData as setOptionDataconditional } from './conditional'
export { prepareOptionData as prepareOptionDataDefinitions, setOptionData as setOptionDataDefinitions } from './definitions'
export { prepareOptionData as prepareOptionOperation, setOptionData as setOptionDataOperation } from './operation'
export { prepareOptionData as prepareOptionUiOptions, setOptionData as setOptionDataUiOptions } from './uioptions';



export const subschemaMap = {
    "uioptions": uioptionsSchemaResolver,
    'http://json-schema.org/draft-07/schema': draft07,
    'jsonforms_ui_rule.schema.json': jfUiRule,
    'validation.schema': validationSubschema.schema,
    'validation.uischema': validationSubschema.uischema,
    'rule.schema': ruleSubschema.schema,
    'rule.uischema': ruleSubschema.uischema,

    'labelAndI18n.schema': labelSchema,
    'labelAndI18n.both.uischema': labelModeBoth.uischema,
    'labelAndI18n.schema.uischema': labelModeSchema.uischema,
    'labelAndI18n.ui.uischema': labelModeUi.uischema,

    // 'styles.schema': stylesSubschema.schema,
    // 'styles.uischema': stylesSubschema.uischema,
    'const.schema': constSubschema.schema,
    'const.uischema': constSubschema.uischema,
    'conditional.schema': conditionalSubschema.schema,
    'conditional.uischema': conditionalSubschema.uischema,
    'definitions.schema': definitionsSubschema.schema,
    'definitions.uischema': definitionsSubschema.uischema,
    'operation.schema': operationSubschema.schema,
    'operation.uischema': operationSubschema.uischema,
    'uiOptions.schema': uiOptionsSubschema.schema,
    'uiOptions.uischema': uiOptionsSubschema.uischema,
} as Record<string, any>
