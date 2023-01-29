import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {Category} from "@jsonforms/core/src/models/uischema";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import flexArea from "../../components/tools/flexArea.vue";
import {jsonForms as toolOptionsLabelProperty} from "../../schema/toolOptionsLabelProperty";


export const categoryTool = new Tool('flexArea', ToolProps.create({
    toolType: 'tab',
    jsonForms: {uischema: {type: 'Category'}}
}), rankWith(1, uiTypeIs('Category')));

categoryTool.importer = () => flexArea;
categoryTool.optionJsonforms = async () => toolOptionsLabelProperty;

categoryTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const uischema = tool.props.jsonForms.uischema as Category;

    if (uischema.label !== undefined) {
        data.label = uischema.label;
    }
    if (uischema.i18n !== undefined) {
        data.i18n = uischema.i18n;
    }

    return data;
};

categoryTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const uiSchema = tool.props.jsonForms.uischema as Category;
    uiSchema.label = data.label;
    uiSchema.i18n = data.i18n;
};
