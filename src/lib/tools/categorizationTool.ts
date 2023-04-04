import categorizationComp from "../../components/tools/categorization.vue";
import {VerticalLayout} from "./layoutTool";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/categorization.form.json";

export class CategorizationTool extends VerticalLayout {
    importer = () => categorizationComp;

    clone(): ToolInterface {
        return new CategorizationTool(this.uischema.type);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Tabs',//this.uischema.type,
            labelAtDropArea: 'Tabs',//this.uischema.type,
            icon: 'mdi:tab',
        }
    }
}

export const categorizationTool = new CategorizationTool('Categorization');

