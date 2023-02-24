import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, ToolInterface} from "./index";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/combinator.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/combinator.schema";

export class CombinatorTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(2, and(uiTypeIs('Control'), (uischema, schema) => {
        const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
        const noType = undefined === schema?.type
        return hasKeyword && noType
    }));
    clone = (): ToolInterface => new CombinatorTool(this.uischema.type);


    constructor(uischemaType: string = 'Unknown') {
        super(uischemaType);

        //:INFO do not set empty keyword (with cloneEmptyTool() schema is never set - therefore its always empty),
        // let keyword = CombinatorTool.getKeyword(this.schema);
        // if(undefined === keyword) {
        //     keyword = 'anyOf';
        //     this.schema.anyOf = [];
        // }
        //this.keyword = keyword;
    }

    optionDataPrepare(tool: ToolInterface): Record<string, any> {

        return {
            propertyName: this.propertyName,
            keyword: CombinatorTool.getKeyword(this.schema),
            options: this.uischema?.options ?? {}
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)

        const keyword = data?.keyword;
        const keywordOld = CombinatorTool.getKeyword(this.schema);

        if(keyword && keywordOld && keyword !== keywordOld) {
            this.schema[keyword] = this.schema[keywordOld] ?? [];
            delete this.schema[keywordOld];
        }

        if(!keyword && !keywordOld) {
            this.schema['anyOf'] = []
        }
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    static getKeyword(schema: JsonSchema): 'oneOf' | 'allOf' | 'anyOf' | string | undefined {
        //if (schema?.oneOf && schema.oneOf?.length > 0) {
        if (undefined !== schema?.oneOf) {
            return 'oneOf';
        }
        //if (schema?.anyOf && schema.anyOf?.length > 0) {
        if (undefined !== schema?.anyOf) {
            return 'anyOf';
        }
        //if (schema?.allOf && schema.allOf?.length > 0) {
        if (undefined !== schema?.allOf) {
            return 'allOf';
        }
        return undefined;
    }

    static getKeywordSchemas(schema: JsonSchema): JsonSchema[] | undefined {
        const keyword = CombinatorTool.getKeyword(schema);
        /** @ts-ignore */
        return keyword && schema[keyword];
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Combinator',
            icon: 'mdi:folder-pound',
            //  labelAtDropArea:this.keyword ?? 'anyOf',

        }
    }
}

// @ts-ignore
export const combinatorTool = new CombinatorTool('Control');
