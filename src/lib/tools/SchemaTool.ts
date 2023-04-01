import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "./index";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/schema.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/schema.form.json";

export const schemaKeywords = ['if', 'then', 'else', 'not', 'contains'];

export class SchemaTool extends AbstractTool implements ToolInterface {

    keyword:string|undefined;

    importer = () => toolComponent;
    tester = rankWith(-1, (uischema, schema) => {
        const hasKeyword = schema && 'if' in schema
        return hasKeyword
    });
    clone = (): ToolInterface => new SchemaTool(this.keyword);


    constructor(keyword: string = 'if') {
        super()
        this.uischema = {};
        this.keyword = keyword;
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        return {
            propertyName: this.propertyName,
            keyword: this.keyword,
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)

        const keyword = data?.keyword;
        const keywordOld = this.keyword;

        if(keyword && keywordOld && keyword !== keywordOld) {
            // // /** @ts-ignore **/
            // this.schema[keyword] = undefined;//this.schema[keywordOld] ?? [];
            // /** @ts-ignore **/
            // this.schema[keywordOld] = undefined;
            this.keyword = keyword;

            console.log("schemaTool","updated",this.schema);
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
            icon: 'mdi:code-not-equal',
            //  labelAtDropArea:this.keyword ?? 'anyOf',

        }
    }
}

// @ts-ignore
export const schemaTool = new SchemaTool('if');
