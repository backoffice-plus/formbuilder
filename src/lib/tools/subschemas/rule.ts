import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../index";
import _ from "lodash";

export const prepareOptionData = (context:ToolContext, schema:JsonSchema, uischema:UISchemaElement) : Record<string, any> => {
    const rule = uischema.rule;
    return {rule:{rule:rule}};
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

    let rule = data?.rule?.rule;

    //ruleSchema (WIP)
    if(data.rule?.ruleSchema) {
        rule =  {
            "effect": "ENABLE",
            "condition": {
                "scope": "#",
                "schema": data.rule?.ruleSchema ?? {}
            }
        }
    }

    uischema.rule = rule;

    if(_.isEmpty(uischema.rule)) {
        delete uischema.rule;
    }
}
