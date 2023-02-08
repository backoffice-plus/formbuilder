import type {JsonFormsInterface, ToolInterface} from "../models";
import {AbstractTool} from "../models";
import toolComponent from "../../components/tools/schema.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/schema.schema";
import {rankWith} from "@jsonforms/core";

export class SchemaTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(-1, () => false)
    clone = (): ToolInterface => new SchemaTool(this.uischema.type, 'schema');

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        return {
            propertyName: this.propertyName,
            type: this.schema.type ?? 'object',
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)

        this.schema.type = data?.type ?? 'object';
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }
}

// @ts-ignore
export const schemaTool = new SchemaTool('Control', 'schema');
