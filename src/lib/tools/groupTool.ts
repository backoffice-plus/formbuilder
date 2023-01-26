import type {GroupLayout} from "@jsonforms/core";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import flexArea from "../../components/tools/flexArea.vue";
import {jsonForms as toolOptionsLabelProperty} from "../../schema/toolOptionsLabelProperty";

export const groupTool = new Tool('flexArea', ToolProps.create({
    toolType: 'group',
    jsonForms: {uischema: {type: 'Group'}}
}), rankWith(1, uiTypeIs('Group')));
groupTool.importer = () => flexArea;
groupTool.optionJsonforms = toolOptionsLabelProperty;

groupTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const uischema = tool.props.jsonForms.uischema as GroupLayout;

    if (uischema.label !== undefined) {
        data.label = uischema.label;
    }
    if (uischema.i18n !== undefined) {
        data.i18n = uischema.i18n;
    }

    return data;
};

groupTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const uiSchema = tool.props.jsonForms.uischema as GroupLayout;
    uiSchema.label = data.label;
    uiSchema.i18n = data.i18n;
};
