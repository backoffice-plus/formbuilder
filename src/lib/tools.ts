import {shallowRef} from "vue";
import formInputByType from "../components/tools/formInputByType.vue";
import flexArea from "../components/tools/flexArea.vue";
import categorization from "../components/tools/categorization.vue";
import label from "../components/tools/label.vue";
import reference from "../components/tools/reference.vue";
import combinatorAsTabs from "../components/tools/combinatorAsTabs.vue";
import unknown from "../components/tools/unknown.vue";
import { Tool, ToolProps} from "./models";
import type {JsonFormsSchema, JsonFormsUISchema} from "./models";
import _ from "lodash";
import {and, isBooleanControl, isNumberControl, isOneOfControl, isStringControl, or, rankWith} from "@jsonforms/core";
import {isIntegerControl, uiTypeIs} from "@jsonforms/core/src/testers/testers";




export const  findLayoutTool = (schema:JsonFormsSchema|undefined = undefined, itemUischema: JsonFormsUISchema) : Tool => {
    const tool = [...layoutTools, ...[tools.tab]].find(comp => comp.props.jsonForms.uischema.type === itemUischema.type)

    if(!tool) {
        console.log("no layout tool was found",schema,itemUischema);
        return new Tool('unknown', ToolProps.create({
            toolType: 'unknown',
            jsonForms: {schema:{}, uischema:{}}
        }));
    }

    return tool.clone(schema, itemUischema);
}

export const findControlToolByTester = (schema:any, itemSchema:any, itemUischema:any) : Tool => {
    const toolsWithScore = controlTools.map((tool, index) => {
        if(!tool.tester) {
            throw "Tool has no tester";
        }
        return {
            tool: tool,
            score: tool.tester(itemUischema, itemSchema, { rootSchema: schema, config: null}),
        }
    });

    const toolWithScore = _.maxBy(toolsWithScore,(i)=>i.score)
    if(!toolWithScore?.tool || -1 === toolWithScore?.score) {
        console.log("no control tool was found",itemSchema,itemUischema);
        return new Tool('unknown', ToolProps.create({
            toolType: 'unknown',
            jsonForms: {schema:itemSchema, uischema:{}}
        }));
    }
    return toolWithScore.tool;
};

export const tools = {
    tab: new Tool('flexArea', ToolProps.create({
        toolType:'tab',
        jsonForms: {uischema: {type: 'Category'}}
    })),
};

export const layoutTools = [

    new Tool('flexArea', ToolProps.create({
        toolType:'flex',
        jsonForms: {uischema: {type: 'VerticalLayout'}},
        toolName: 'Vertical Layout',
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'flexRow',
        jsonForms: {uischema: {type: 'HorizontalLayout'}},
        toolName: 'Horizontal Layout',
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'group',
        jsonForms: {uischema: {type: 'Group'}}
    })),

    new Tool('categorization', ToolProps.create({
        toolType:'tabs',
        jsonForms: {uischema: {type: 'Categorization'}},
    })),

    new Tool('label', ToolProps.create({
        toolType:'label',
        jsonForms: {uischema: {type: 'Label', text:'label'}},
    })),
];

export const controlTools = [

    new Tool('formInputByType', ToolProps.create({
        toolType: 'control',
        toolName: 'Control',
        jsonForms: {schema:{type:'string'}, uischema:{type:'Control'}}
    }), rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl))),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'select',
        jsonForms: {schema:{type:'string',oneOf:[]}, uischema:{type:'Control'}}
    }), rankWith(1, and(isStringControl, isOneOfControl))),


    new Tool('reference', ToolProps.create({
        toolType: 'reference',
        jsonForms: {schema:{}, uischema:{type:'Control'}}
    }), rankWith(1,
        and(
            uiTypeIs('Control'),
            (uischema,schema) => undefined !== schema?.$ref
        )
    )),

    new Tool('combinatorAsTabs', ToolProps.create({
        toolType: 'combinator',
        jsonForms: {schema:{}, uischema:{type:'Control'}}
    }), rankWith(2,
        and(
            uiTypeIs('Control'),
            (uischema,schema) => {
                const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
                const noType = undefined === schema?.type
                return hasKeyword && noType
            }
        )
    )),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'textarea',
    //     jsonForms: {schema:{type:'string'}, uischema:{type:'Control', options:{multi:true}}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'number',
    //     jsonForms: {schema:{type:'number'}, uischema:{type:'Control'}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'date',
    //     jsonForms: {schema:{type:'string', format: 'date'}, uischema:{type:'Control'}}
    // })),

    //via optionModal.format
    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'datetime-local',
    //     jsonForms: {schema:{type:'string', format: 'date-time'}, uischema:{type:'Control'}}
    // })),
    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'time',
    //     jsonForms: {schema:{type:'string', format: 'time'}, uischema:{type:'Control'}}
    // })),

    //no jsonforms renderer
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'radio',
    //     jsonForms: {schema:{type:'string',enum:[]}, uischema:{type:'Control', options:{format:'radio'}}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'checkbox',
    //     jsonForms: {schema:{type:'boolean'}, uischema:{type:'Control'}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'file',
    //     jsonForms: {schema:{type:'string', format:'file'}, uischema:{type:'Control'}}
    // })),


    //try to solve with optionmodal
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'number',
    //     jsonForms: {schema:{type:'integer'}, uischema:{type:'Control'}}
    // })),

    //no renderer for slider:true
    // new Tool('formInputByType', ToolProps.create({
    //   inputType: 'range',
    //   jsonForms: {schema:{type:'number'}, uischema:{type:'Control',options:{"slider": true }}}
    //   //{type: 'number',"minimum": 1,"maximum": 5, "default": 2}
    // })),
];

export const importToolComponent = (componentName:string, useShallowRef:boolean|undefined = false) => {
    const asShallowRef = (e:any) => {
        return useShallowRef ? shallowRef(e) : e;
    }

    if('categorization' === componentName) {
        return asShallowRef(categorization);
    }
    else if('formInputByType' === componentName) {
        return asShallowRef(formInputByType);
    }
    else if('label' === componentName) {
        return asShallowRef(label);
    }
    else if('reference' === componentName) {
        return asShallowRef(reference);
    }
    else if('combinatorAsTabs' === componentName) {
        return asShallowRef(combinatorAsTabs);
    }
    else if('unknown' === componentName) {
        return asShallowRef(unknown);
    }
    else {
        return asShallowRef(flexArea);
    }
}

// export const importAsyncComponent = (componentName:string) => {
//     if('categorization' === componentName) {
//         return defineAsyncComponent(() => import("~/lib/formbuilder/components/tools/categorization.vue"))
//     }
//     else if('formInputByType' === componentName) {
//         return defineAsyncComponent(() => import("~/lib/formbuilder/components/tools/formInputByType.vue"))
//     }
//     else {
//         return defineAsyncComponent(() => import("~/lib/formbuilder/components/tools/flexArea.vue"))
//     }
// }
