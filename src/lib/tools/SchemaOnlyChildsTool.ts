import {and, rankWith} from "@jsonforms/core";
import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schemaOnlyChilds.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/object.form.json";
import _ from "lodash";
import {SchemaTool} from "./SchemaTool";
import * as subschemas from "./subschemas";

//export const schemaKeywords = ['if', 'then', 'else', 'not', 'contains'];

export class SchemaOnlyChildsTool extends SchemaTool {

    importer = () => toolComponent;
    clone = (): ToolInterface => new SchemaOnlyChildsTool();

    constructor() {
        super()
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        return {
            propertyName: this.propertyName,
            type: this.schema.type,
            //schema: schema,
            // ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            // ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
            // ...subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            // ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataDefinitions(context, this.schema, this.uischema),
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
        updatePropertyNameAndScope(data?.propertyName, this)
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
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }


    toolbarOptions(): Record<string, any> {
        return {
            title: 'Schema Onyl Childs',
            //icon: 'mdi:code-not-equal',
            icon: 'mdi:folder-text',
            //  labelAtDropArea:this.keyword ?? 'anyOf',
            //hideToolAtBar: true,

        }
    }

    generateJsonSchema(): JsonSchema {
        const properties = {} as Record<string, JsonSchema>;
        const required = [] as Array<string>;

        this.childs.forEach((childTool: ToolInterface) => {
            //probably uischema
            if(_.isEmpty(childTool.schema)) {
                return;
            }

            properties[childTool.propertyName] = childTool.generateJsonSchema();

            if (childTool.isRequired) {
                required.push(childTool.propertyName);
            }
        });

        return {
            ...this.schema,
            type: 'object',
            properties: properties,
            required: required.length ? required : undefined,
            //...conditionalSchemas
        } as JsonSchema;
    }
}

// @ts-ignore
export const schemaOnlyChildsTool = new SchemaOnlyChildsTool();
