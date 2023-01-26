import {Tool, ToolProps} from "../models";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

import flexArea from "../../components/tools/flexArea.vue";

export const verticalLayout = new Tool('flexArea', ToolProps.create({
    toolType: 'flex',
    jsonForms: {uischema: {type: 'VerticalLayout'}},
    toolName: 'Vertical Layout',
}), rankWith(1, uiTypeIs('VerticalLayout')));
verticalLayout.importer = () => flexArea;

export const horizontalLayout = new Tool('flexArea', ToolProps.create({
    toolType: 'flexRow',
    jsonForms: {uischema: {type: 'HorizontalLayout'}},
    toolName: 'Horizontal Layout',
}), rankWith(1, uiTypeIs('HorizontalLayout')));
horizontalLayout.importer = () => flexArea;
