import {and, rankWith} from "@jsonforms/core";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schemaOnlyChilds.component.vue";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/schemaOnlyChilds.form.json";
import * as _ from 'lodash-es';
import {SchemaTool} from "./SchemaTool";
import * as subschemas from "./subschemas";
import {cloneToolWithSchema} from "../toolCreation";
import {getPlainProperty, getRequiredFromSchema} from "../normalizer";

//export const schemaKeywords = ['if', 'then', 'else', 'not', 'contains'];

//export class SchemaOnlyChildsTool extends SchemaTool {
export class SchemaOnlyChildsTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    // @ts-ignore
    tester = rankWith(-1, () => {return false});
    clone = (): ToolInterface => new SchemaOnlyChildsTool();

    constructor() {
        super();

        //default type
        this.schema.type = 'object'
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        return {
            propertyName: this.propertyName,
            schema: {
                type: this.schema.type,
            },
            additionalProperties: this.schema.additionalProperties,
            //schema: schema,
            // ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            // ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
            // ...subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            // ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataDefinitions(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            _isUischema:'uischema' === context?.builder,
            _isBaseTool:context.baseSchemaTool === this,
        } as any;


        //
        //
        // const isBaseTool = context.baseSchemaTool === this;
        //
        // let type = this.schema.type;
        //
        // const data = {
        //     type: type,
        //     _isBaseTool: isBaseTool,
        // } as any;
        //
        // if(this.propertyName) {
        //     data.propertyName = this.propertyName;
        // }
        //
        // return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);
        this.schema.type = data.schema.type;
        this.schema.additionalProperties = data.additionalProperties;
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

        subschemas.setOptionDataDefinitions(this.schema, this.uischema, data);
        subschemas.setOptionDataValidation(this.schema, this.uischema, data);
        subschemas.setOptionDataconditional(this.schema, this.uischema, data);

        // const schema = {...data}
        // delete schema.propertyName;
        // delete schema._isBaseTool;

        // this.schema = {
        //     ...this.schema,
        //    // ...schema
        //     //...data.schema
        // }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema, undefined, this, context),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }


    toolbarOptions(): Record<string, any> {
        return {
            //title: 'Schema Onyl Childs',
            title: 'Properties or Items',
            //icon: 'mdi:code-not-equal',
            icon: 'mdi:folder-text',//'mdi:folder-table',
            //icon: 'mdi:format-list-group',
            //  labelAtDropArea:this.keyword ?? 'anyOf',
            hideToolAtBar: true,

        }
    }

    generateJsonSchema(): JsonSchema|undefined {
        const properties = {} as { [property: string]: JsonSchema };
        const required = [] as string[];

        this.childs.forEach((childTool: ToolInterface) => {
            //probably uischema
            if(_.isEmpty(childTool.schema)) {
                return;
            }

            let childSchema = childTool.generateJsonSchema();
            if(childSchema) {
                properties[childTool.propertyName] = childSchema;

                if (childTool.isRequired) {
                    required.push(childTool.propertyName);
                }
            }
        });

        const schema = {...this.schema} as JsonSchema;

        if('object' === schema.type) {
            (schema.properties as any) = properties
            schema.required = required.length ? required : undefined;
        }
        else if('array' === schema.type) {
            /**
             * :TODO thats probably not correct
             */
            /** @ts-ignore */
            const items = Object.values(properties);
            schema.items = items[0];
        }

        return schema;
    }


    //:INFO copypast from objectTool
    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const tools = [] as Array<ToolInterface>;

        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }


        const properties = this.schema?.properties ?? {};
        !_.isEmpty(properties) && Object.keys(properties).forEach((propertyName:string) => {
            const itemSchema = properties[propertyName];
            const uischema = {type:'Control',scope:'#'} as UISchemaElement;
            //const clone = cloneToolWithSchema(schemaTool, itemSchema, {});
            const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
            clone.propertyName = propertyName;

            //required
            const required = getRequiredFromSchema(clone.propertyName, this.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }

            clone.edge.setParent(this);
            clone.edge.replaceChilds(clone.initChilds(toolFinder));

            tools.push(clone);
        });

        //:TODO remove
        //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

        return tools;
    }
}

// @ts-ignore
export const schemaOnlyChildsTool = new SchemaOnlyChildsTool();
