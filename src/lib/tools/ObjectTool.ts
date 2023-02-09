import type {JsonFormsInterface, ToolInterface} from "../models";
import {AbstractTool} from "../models";
import toolComponent from "../../components/tools/object.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/object.schema";
import {rankWith} from "@jsonforms/core";

export class ObjectTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(1, (uischema, schema, context) => {
        return uischema?.type === 'Control' && schema?.type === 'object' && undefined !== schema?.properties
    })
    clone = (): ToolInterface => new ObjectTool(this.uischema.type, 'object');

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        if(!this.schema.type) {
            this.schema.type = 'object'
        }
        return {
            propertyName: this.propertyName,
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }
}

// @ts-ignore
export const objectTool = new ObjectTool('Control', 'object');
