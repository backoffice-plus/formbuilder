import {rankWith} from "@jsonforms/core";
import type {JsonSchema} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {LabelElement} from "@jsonforms/core/src/models/uischema";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import labelComp from "../../components/tools/label.vue";
import {jsonForms as toolOptionsLabel, prepareOptionDataRule, setOptionDataRule} from "./schema/toolLabel";
import _ from "lodash";
import {resolveSchema} from "../formbuilder";


export const labelTool = new Tool('label', ToolProps.create({
    toolType: 'label',
    jsonForms: {uischema: {type: 'Label', text: 'label'}},
}), rankWith(1, uiTypeIs('Label')));

labelTool.importer = () => labelComp;

labelTool.optionJsonforms = async () => {
    return {
        schema: await resolveSchema(toolOptionsLabel.schema),
        uischema: await resolveSchema(toolOptionsLabel.uischema),
    }
};

labelTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.uischema as LabelElement;

    return {
        text: uischema.text,
        i18n: uischema.i18n,
        options: uischema.i18n ?? {},
        ...prepareOptionDataRule(schema, uischema),
    } as any;
};

labelTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema | Record<string, any>;
    const uischema = tool.props.jsonForms.uischema as LabelElement;
    uischema.text = data.text;
    uischema.i18n = data.i18n;

    uischema.options = data.options ?? {};

    setOptionDataRule(schema, uischema, data);
};
