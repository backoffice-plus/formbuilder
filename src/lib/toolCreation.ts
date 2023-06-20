// @ts-ignore
import _ from "lodash";
import type {formbuilderPropsI, ToolContext, ToolInterface} from "./models";
import type {JsonSchema, UISchemaElement, Layout} from "@jsonforms/core";
import {generateDefaultUISchema, generateJsonSchema} from "@jsonforms/core";
import {fromScopeToProperty} from './normalizer';
import {objectTool, ObjectTool} from "./tools/ObjectTool";
import type {ToolFinder} from "./ToolFinder";
import {SchemaTool, schemaTool} from "./tools/SchemaTool";
import {formbuilderProps} from "./models";
import {arrayTool} from "./tools/ArrayTool";

export const initBaseTools = (toolFinder: ToolFinder, props:formbuilderPropsI) => {
    // if(props.schemaOnly) {
    //   //baseSchemaTool.value = createSchemaTool(rootSchema.value, props.schemaTool);
    //   baseSchemaTool.value = cloneToolWithSchema(new SchemaOnlyChildsTool(), rootSchema.value)
    //   baseSchemaTool.value.propertyName = 'schema'
    // }
    // else {
    //   //baseSchemaTool.value = cloneToolWithSchema(new ObjectTool(), rootSchema.value)
    //   baseSchemaTool.value = cloneToolWithSchema(new SchemaOnlyChildsTool(), rootSchema.value)
    //   baseSchemaTool.value.propertyName = 'schema'
    // }
    // if(true !== props.schemaOnly) {
    //     if(props.schemaReadOnly) {
    //         baseUiTool.value = createBaseTool(toolFinder);
    //     }
    //     else {
    //         baseUiTool.value = createBaseTool(toolFinder, rootSchema.value, rootUischema.value);
    //     }
    // }

    const schemaOnly = props.schemaOnly;
    const schemaReadOnly = props.schemaReadOnly;
    const baseSchemaToolName = props.schemaTool;
    const baseSchemaToolProps = props.schemaToolProps;
    const rootSchema = props?.schema ?? props?.jsonForms?.schema ?? {};
    const rootUischema = props?.uischema ?? props?.jsonForms?.uischema ?? {};

    const schema = createSchemaTool(rootSchema, baseSchemaToolName, baseSchemaToolProps);
    schema.edge.replaceChilds(schema.initChilds(toolFinder));

    let uischema = undefined;
    if(!schemaOnly) {

        uischema = createBaseTool(toolFinder, rootSchema, rootUischema);
        uischema.edge.replaceChilds(uischema.initChilds(toolFinder, schema));

        //:INFO schemaReadyOnly can also have a init uischema!!!
        // if(schemaReadOnly) {
        //     uischema = createBaseTool(toolFinder);
        // }
        // else {
        //     uischema = createBaseTool(toolFinder, rootSchema, rootUischema);
        // }
    }

    return {schema, uischema};
}

export const createBaseTool = (toolFinder: ToolFinder, schema: JsonSchema|undefined = undefined, uischema: UISchemaElement|undefined = undefined): ToolInterface => {
    if (undefined === schema) {
        schema = generateJsonSchema({});
    }
    if (undefined === uischema) {
        uischema = generateDefaultUISchema(schema);
    }
    return toolFinder.findBaseTool(schema, uischema);
};

export const createSchemaTool = (schema: JsonSchema, toolName: string | undefined = undefined, schemaToolProps:any): ToolInterface => {

    let clone;
    switch (toolName) {
        case "schema":
            clone = cloneToolWithSchema(schemaTool, schema);
            break;

        default:

            //:TODO do we need SchemaOnlyChildsTool????
            //clone = cloneToolWithSchema(new SchemaOnlyChildsTool(), schema);

            if('array' === schema?.type) {
                clone = cloneToolWithSchema(arrayTool, schema);
            }
            else {
                //:TODO are any other types relevant?!
                clone = cloneToolWithSchema(objectTool, schema);
            }
            break;
    }

    if(schemaToolProps?.propertyName) {
        clone.propertyName = schemaToolProps.propertyName;
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
