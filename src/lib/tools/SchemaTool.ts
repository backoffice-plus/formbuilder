import {rankWith} from "@jsonforms/core";
import type { JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schema.component.vue";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/schema.form.json";
import _ from "lodash";

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
            type: type,
            _isBaseTool: isBaseTool,
        } as any;

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

        const schema = {...data}
        delete schema.propertyName;
        delete schema._isBaseTool;

        this.schema = {
            ...this.schema,
            ...schema
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

        const propertiesDefinedByChilds = [
            // //schema
            "if",
            "then",
            "else",
            "not",
            // "contains",
            // "propertyNames",
            // "additionalItems",
            // "additionalProperties",
            //
            // //object
            //"properties",
            // "definitions",
            // "patternProperties",
            // "dependencies",
            //
            // //array
            // "allOf",
            // "anyOf",
            // "oneOf",
            // "items"
        ];

        const schemaByKeys = {} as any;
        propertiesDefinedByChilds.forEach(key => schemaByKeys[key] = undefined)

        this.childs.forEach((childTool: ToolInterface) => {
            const propertyName = childTool.propertyName;
            let childSchema = childTool.generateJsonSchema();

            if(childSchema) {
                if(propertyName && propertiesDefinedByChilds.includes(propertyName)) {
                        let setSchema = childSchema as any;

                        switch (propertyName) {
                            case "properties":
                            case "definitions":
                            case "patternProperties":
                            case "dependencies":
                                if(childSchema.properties) {
                                    setSchema = childSchema.properties
                                }
                                break;

                            case "allOf":
                            case "anyOf":
                            case "oneOf":
                            case "items":
                                if(childSchema.items) {
                                    setSchema = childSchema.items as JsonSchema
                                    childTool.schema = childSchema;

                                    if((childTool as any).isSchemaItem) {
                                        setSchema = (childSchema.items as any)[0] as JsonSchema
                                        childTool.schema.items = setSchema;
                                    }
                                }
                                break;

                            default:
                                break;
                        }

                        schemaByKeys[propertyName] = setSchema;

                }
                else {
                    schema = {
                        ...schema,
                        ...childSchema
                    } as JsonSchema;
                }
            }
        });


        schema = {...schema, ...schemaByKeys} as JsonSchema;

        return !_.isEmpty(schema) ? schema : undefined;
    }


    initChilds(toolFinder: ToolFinderInterface): ToolInterface[] {
        const tools = [] as Array<ToolInterface>;

        //for moving existing tools to another list
        if(this.childs?.length) {
            return this.childs;
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
