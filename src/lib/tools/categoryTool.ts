import {GroupTool,} from "./groupTool";
import type {ToolInterface} from "./index";
import type {JsonFormsInterface, ToolContext} from "./index";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/category.form.json";

export class CategoryTool extends GroupTool {

    clone(): ToolInterface {
        return new CategoryTool(this.uischema.type);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: this.uischema.label,
            //hideIconAtDropArea: true,
            //icon: 'mdi:tab-plus',
            hideToolAtBar: true,
            icon: 'mdi:tab',
        }
    }
}

export const categoryTool = new CategoryTool('Category');
