import {and, rankWith} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schema.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/schema.form.json";
import _ from "lodash";
import {SchemaTool} from "./SchemaTool";

//export const schemaKeywords = ['if', 'then', 'else', 'not', 'contains'];

export class SchemaOnlyChildsTool extends SchemaTool {

    importer = () => toolComponent;
    clone = (): ToolInterface => new SchemaOnlyChildsTool();

    constructor() {
        super()
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
            title: 'Schema Onyl Childs',
            //icon: 'mdi:code-not-equal',
            icon: 'mdi:folder-text',
            //  labelAtDropArea:this.keyword ?? 'anyOf',
            //hideToolAtBar: true,

        }
    }
}

// @ts-ignore
export const schemaOnlyChildsTool = new SchemaOnlyChildsTool();
