import {Tool, ToolProps} from "../models";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

import flexArea from "../../components/tools/flexArea.vue";
import categorizationComp from "../../components/tools/categorization.vue";
import labelComp from "../../components/tools/label.vue";


const verticalLayout = new Tool('flexArea', ToolProps.create({
    toolType: 'flex',
    jsonForms: {uischema: {type: 'VerticalLayout'}},
    toolName: 'Vertical Layout',
}), rankWith(1, uiTypeIs('VerticalLayout')));
verticalLayout.importer = () => flexArea;

const horizontalLayout = new Tool('flexArea', ToolProps.create({
    toolType: 'flexRow',
    jsonForms: {uischema: {type: 'HorizontalLayout'}},
    toolName: 'Horizontal Layout',
}), rankWith(1, uiTypeIs('HorizontalLayout')));
horizontalLayout.importer = () => flexArea;

const group = new Tool('flexArea', ToolProps.create({
    toolType: 'group',
    jsonForms: {uischema: {type: 'Group'}}
}), rankWith(1, uiTypeIs('Group')));
group.importer = () => flexArea;

const categorization = new Tool('categorization', ToolProps.create({
    toolType: 'tabs',
    jsonForms: {uischema: {type: 'Categorization'}},
}), rankWith(1, uiTypeIs('Categorization')));
categorization.importer = () => categorizationComp;

const category = new Tool('flexArea', ToolProps.create({
    toolType: 'tab',
    jsonForms: {uischema: {type: 'Category'}}
}), rankWith(1, uiTypeIs('Category')));
category.importer = () => flexArea;

const label = new Tool('label', ToolProps.create({
    toolType: 'label',
    jsonForms: {uischema: {type: 'Label', text: 'label'}},
}), rankWith(1, uiTypeIs('Label')));
label.importer = () => labelComp;


export const layoutTools = [
    verticalLayout,
    horizontalLayout,
    group,
    categorization,
    category,
    label,
]
