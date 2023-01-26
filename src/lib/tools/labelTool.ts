import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {LabelElement} from "@jsonforms/core/src/models/uischema";

import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import labelComp from "../../components/tools/label.vue";
import {jsonForms as toolOptionsLabelElement} from "../../schema/toolOptionsLabel";
import {normalizeRule} from "../normalizer";


export const labelTool = new Tool('label', ToolProps.create({
    toolType: 'label',
    jsonForms: {uischema: {type: 'Label', text: 'label'}},
}), rankWith(1, uiTypeIs('Label')));

labelTool.importer = () => labelComp;
labelTool.optionJsonforms = toolOptionsLabelElement;

labelTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const uischema = tool.props.jsonForms.uischema as LabelElement;

    if (uischema.text !== undefined) {
        data.text = uischema.text;
    }
    if (uischema.rule !== undefined) {
        data.rule = normalizeRule(uischema.rule);
    }
    if (uischema.options !== undefined) {
        data.options = uischema.options;
    }
    if (uischema.i18n !== undefined) {
        data.i18n = uischema.i18n;
    }

    return data;
};

labelTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const uiSchema = tool.props.jsonForms.uischema as LabelElement;
    uiSchema.text = data.text;
    uiSchema.i18n = data.i18n;

    //:TODO
    // uiSchema.rule = data.rule;
    // uiSchema.options = data.options;
};
