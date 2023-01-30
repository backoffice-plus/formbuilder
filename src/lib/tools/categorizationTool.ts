import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {Tool, ToolProps} from "../models";
import categorizationComp from "../../components/tools/categorization.vue";
import {verticalLayout} from "./layoutTool";

export const categorizationTool = new Tool('categorization', ToolProps.create({
    toolType: 'tabs',
    jsonForms: {uischema: {type: 'Categorization'}},
}), rankWith(1, uiTypeIs('Categorization')));

categorizationTool.importer = () => categorizationComp;

categorizationTool.optionJsonforms = verticalLayout.optionJsonforms
categorizationTool.optionDataPrepare = verticalLayout.optionDataPrepare;
categorizationTool.optionDataUpdate = verticalLayout.optionDataUpdate
