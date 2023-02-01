import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {Tool, ToolProps} from "../models";
import {groupTool} from "./groupTool";


export const categoryTool = new Tool('flexArea', ToolProps.create({
    toolType: 'tab',
    jsonForms: {uischema: {type: 'Category'}}
}), rankWith(1, uiTypeIs('Category')));

categoryTool.importer = groupTool.importer;
categoryTool.optionJsonforms = groupTool.optionJsonforms
categoryTool.optionDataPrepare = groupTool.optionDataPrepare;
categoryTool.optionDataUpdate = groupTool.optionDataUpdate
