import {rankWith} from "@jsonforms/core";
import type { JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schema.component.vue";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/schema.form.json";
import * as _ from 'lodash-es';

//export const schemaKeywords = ['if', 'then', 'else', 'not', 'contains'];

export class SchemaTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    // @ts-ignore
    tester = rankWith(-1, () => {return false});
    clone = (): ToolInterface => new SchemaTool();


    constructor() {
        super()
        this.uischema = false;
        this.propertyName = '';
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        const isBaseTool = context.baseSchemaTool === this;

        let type = this.schema.type;

        const data = {
            _isBaseTool: isBaseTool,
        } as any;

        if(this.schema.type) {
            data.type = this.schema.type;
        }

        if(this.propertyName) {
            data.propertyName = this.propertyName;
        }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);
        //
        // const keyword = data?.keyword;
        // const keywordOld = this.keyword;
        //
        // if(keyword && keywordOld && keyword !== keywordOld) {
        //     // // /** @ts-ignore **/
        //     // this.schema[keyword] = undefined;//this.schema[keywordOld] ?? [];
        //     // /** @ts-ignore **/
        //     // this.schema[keywordOld] = undefined;
        //     this.keyword = keyword;
        // }

        delete data._isBaseTool;
        delete data.propertyName;

        this.schema = {
            ...this.schema,
            ...data
        }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }


    toolbarOptions(): Record<string, any> {
        return {
            title: 'Schema',
            //icon: 'mdi:code-not-equal',
            //icon: 'mdi:folder-pound',
            //icon: 'mdi:code-block-braces',
            icon: 'mdi:file-code',//-outline
            //  labelAtDropArea:this.keyword ?? 'anyOf',
            hideToolAtBar: true,

        }
    }

    generateJsonSchema(): JsonSchema|undefined {

        let schema = this.schema;

        // const propertiesDefinedByChilds = [
        //     // //schema
        //     "if",
        //     "then",
        //     "else",
        //     "not",
        //     // "contains",
        //     // "propertyNames",
        //     // "additionalItems",
        //      "additionalProperties",
        //     //
        //     // //object
        //     //"properties",
        //     // "definitions",
        //     // "patternProperties",
        //     // "dependencies",
        //     //
        //     // //array
        //     // "allOf",
        //     // "anyOf",
        //     // "oneOf",
        //     // "items"
        // ];
        //
        // const schemaByKeys = {} as any;
        // propertiesDefinedByChilds.forEach(key => schemaByKeys[key] = undefined)
        //
        // this.edge.childs.forEach((childTool: ToolInterface) => {
        //     const propertyName = childTool.propertyName;
        //     let childSchema = childTool.generateJsonSchema();
        //
        //     if(childSchema) {
        //         if(propertyName && propertiesDefinedByChilds.includes(propertyName)) {
        //                 let setSchema = childSchema as any;
        //
        //                 switch (propertyName) {
        //                     case "properties":
        //                     case "definitions":
        //                     case "patternProperties":
        //                     case "dependencies":
        //                         if(childSchema.properties) {
        //                             setSchema = childSchema.properties
        //                         }
        //                         break;
        //
        //                     case "allOf":
        //                     case "anyOf":
        //                     case "oneOf":
        //                     case "items":
        //                         if(childSchema.items) {
        //                             setSchema = childSchema.items as JsonSchema
        //                             childTool.schema = childSchema;
        //
        //                             if((childTool as any).isSchemaItem) {
        //                                 setSchema = (childSchema.items as any)[0] as JsonSchema
        //                                 childTool.schema.items = setSchema;
        //                             }
        //                         }
        //                         break;
        //
        //                     default:
        //                         break;
        //                 }
        //
        //                 schemaByKeys[propertyName] = setSchema;
        //
        //         }
        //         else {
        //             schema = {
        //                 ...schema,
        //                 ...childSchema
        //             } as JsonSchema;
        //         }
        //     }
        // });


        const firstChild = this.edge.childs[0]; //SchemaTool MUST have only one child!
        const newSchema = firstChild?.generateJsonSchema();

        console.log("SchemaTool.generateJsonSchema", {thiss:this,newSchema})

        return !_.isEmpty(newSchema) ? newSchema : undefined;
    }


    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const tools = [] as Array<ToolInterface>;

        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }

        if(_.isEmpty(this.schema)) {
            return [];
        }

        const schema = {...this.schema}
        const uischema = {type:'Control',scope:'#'} as UISchemaElement;

        console.log("SchemaTool.initChilds", {thiss:this,schema:this.schema})

        if(!schema.type) {
            if("properties" in schema) {
                schema.type = 'object';
            }
            else if("required" in schema) {
                schema.type = 'object';
            }
            // else {
            //     console.warn("schema has no type: "+ schema)
            // }
        }

        const clone = toolFinder.findMatchingToolAndClone({}, schema, uischema);

        clone.edge.setParent(this);
        clone.edge.replaceChilds(clone.initChilds(toolFinder));
        tools.push(clone);

        console.log("SchemaTool.initChilds findMatchingToolAndClone", {schema, clone})

        return tools;
    }

    initChildsOld(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const tools = [] as Array<ToolInterface>;

        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }

        const uischema = {type:'Control',scope:'#'} as UISchemaElement;

        const properties = this.schema
        const propertyKeys = Object.keys(this.schema)

        propertyKeys.forEach((propertyName:string) => {

            const propertyData = (properties as any)[propertyName];
            let clone, itemSchema;

            switch (propertyName) {
                case "$defs":
                case "properties":
                case "definitions":
                case "patternProperties":
                case "dependencies":
                    itemSchema = {
                        type: 'object',
                        properties: propertyData
                    }
                    clone = toolFinder.findMatchingToolAndClone({}, itemSchema, uischema);
                    clone.propertyName = propertyName;
                    clone.edge.setParent(this);
                    clone.edge.replaceChilds(clone.initChilds(toolFinder));
                    tools.push(clone);

                    break;

                case "allOf":
                case "anyOf":
                case "oneOf":
                case "items":
                    itemSchema = {
                        type: 'array',
                        items: propertyData
                    }
                    clone = toolFinder.findMatchingToolAndClone({}, itemSchema, uischema);
                    clone.propertyName = propertyName;
                    clone.edge.setParent(this);
                    clone.edge.replaceChilds(clone.initChilds(toolFinder));
                    tools.push(clone);
                    break;

                default:
                    break;
            }
        });

        return tools;
    }
}

// @ts-ignore
export const schemaTool = new SchemaTool();
