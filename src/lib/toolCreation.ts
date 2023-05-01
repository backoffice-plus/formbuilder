// @ts-ignore
import _ from "lodash";
import type {ToolContext, ToolInterface} from "./models";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {generateDefaultUISchema, generateJsonSchema} from "@jsonforms/core";
import {fromScopeToProperty} from './normalizer';
import {ObjectTool} from "./tools/ObjectTool";
import type {ToolFinder} from "./ToolFinder";
import {SchemaTool, schemaTool} from "./tools/SchemaTool";

export const createBaseTool = (toolFinder: ToolFinder, schema: JsonSchema, uischema: UISchemaElement): ToolInterface => {
    if (undefined === schema) {
        schema = generateJsonSchema({});
    }
    if (undefined === uischema) {
        uischema = generateDefaultUISchema(schema);
    }

    return toolFinder.findBaseTool(schema, uischema);
};

/**
 * @deprecated
 * @see FormBuider::initBaseTools() hardcoded to SchemaOnlyChildsTool
 */
export const createSchemaTool = (schema: JsonSchema, baseToolName: string | undefined = undefined): ToolInterface => {

    let clone;
    switch (baseToolName) {
        case "schema":
        case "schema.not":
        case "schema.if":
        case "schema.else":
        case "schema.then":
            clone = cloneToolWithSchema(schemaTool, schema);
            // if (clone instanceof SchemaTool) {
            //     clone.keyword = baseToolName?.match(/[^.]+$/)?.[0] ?? 'if';
            //     //clone.propertyName = false;
            // }
            break;

        default:
            // clone = cloneToolWithSchema(new ObjectTool(), schema);
            // clone.propertyName = 'schema';
            schema.type ??= 'object';
            clone = cloneToolWithSchema(schemaTool, schema);
            //clone.propertyName = 'schema';
            break;
    }

    return clone;

}
// export const createDefTool = (schema: JsonSchema): ToolInterface => {
//     const defSchema = {
//         type:'object',
//         properties: schema.definitions
//     } as JsonSchema;
//
//     const tool = cloneToolWithSchema(objectTool, defSchema);
//     tool.propertyName = 'definitions';
//
//     return tool;
// }


let cloneCounter = 0;
export const cloneEmptyTool = (tool: ToolInterface, schema: JsonSchema | undefined = undefined) => {

    const clone = tool.clone();
    if (tool.uischema.type) {
        clone.propertyName = (tool.uischema.type + ++cloneCounter).toLowerCase();
    }

    if (schema) {
        _.merge(clone.schema, {...schema})
    }

    //set default data
    //:DEV is that needed?!?!
    const context = {
        parentMethod: 'formbuilderbar.cloneEmptyTool',
    } as ToolContext;
    const defaultData = clone.optionDataPrepare(context)
    clone.optionDataUpdate(context, defaultData);

    return clone;
};


export const cloneToolWithSchema = (tool: ToolInterface, schema: JsonSchema, uischema: UISchemaElement | undefined = undefined): ToolInterface => {

    //clone
    const clone = tool.clone();
    _.merge(clone.schema, {...schema})
    if (uischema) {
        _.merge(clone.uischema, {...uischema})
    }

    if (_.isObject(clone.uischema) && "scope" in clone.uischema) {
        clone.propertyName = fromScopeToProperty(clone.uischema.scope as string)
    }

    //set default data (sets init data if schema hasnt)
    //:INFO is needed for
    //:DEV is that needed?!?!
    const context = {
        parentMethod: 'formbuilderbar.cloneToolWithSchema',
    } as ToolContext;
    const defaultData = clone.optionDataPrepare(context)
    clone.optionDataUpdate(context, defaultData);

    return clone;
};


// export const getChildComponents = (component:any, namePrefix:string|null) => {
//     const childComponents = {} as Record<string, any>;
//
//     console.log("formbuilder.ts","getChildComponents",component)
//
//     const refs = Object.keys(component.$refs)
//         .filter(key => key.includes(namePrefix ?? 'components') && component.$refs[key])
//         .map(key => {
//             let reff = component.$refs[key];
//             if(reff.length) {
//                 reff = reff[0];
//                 if(1 < reff.length) {
//                     throw "there are more then one $refs with key "+ key
//                 }
//             }
//             return reff;
//         });
//
//     refs.map(reff => {
//         if(!reff.tool.uuid)  {
//             throw "no uuid in getChildComponents";
//         }
//
//         childComponents[reff.tool.uuid] = reff
//     })
//
//     return childComponents;
// };
