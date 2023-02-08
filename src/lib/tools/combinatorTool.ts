import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, ToolInterface} from "../models";
import {AbstractTool} from "../models";
import toolComponent from "../../components/tools/combinator.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/combinator.schema";

export class CombinatorTool extends AbstractTool implements ToolInterface {

    keyword: 'oneOf' | 'allOf' | 'anyOf' | undefined = undefined;

    importer = () => toolComponent;
    tester = rankWith(2, and(uiTypeIs('Control'), (uischema, schema) => {
        const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
        const noType = undefined === schema?.type
        return hasKeyword && noType
    }));
    clone = (): ToolInterface => new CombinatorTool(this.uischema.type, 'combinator');

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        return {
            propertyName: this.propertyName,
            keyword: CombinatorTool.getKeyword(this.schema),
            options: this.uischema?.options ?? {}
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)

        this.keyword = data?.keyword ?? 'anyOf';
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    static getKeyword(schema: JsonSchema): string | undefined {
        if (schema?.oneOf && schema.oneOf?.length > 0) {
            return 'oneOf';
        }
        if (schema?.anyOf && schema.anyOf?.length > 0) {
            return 'anyOf';
        }
        if (schema?.allOf && schema.allOf?.length > 0) {
            return 'allOf';
        }
        return undefined;
    }

    static getKeywordSchemas(schema: JsonSchema): JsonSchema[] | undefined {
        const keyword = CombinatorTool.getKeyword(schema);
        /** @ts-ignore */
        return keyword && schema[keyword];
    }
}

// @ts-ignore
export const combinatorTool = new CombinatorTool('Control', 'combinator');
