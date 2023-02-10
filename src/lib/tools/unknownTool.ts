import {AbstractTool} from "./AbstractTool";
import type {JsonFormsInterface, ToolInterface} from "./index";
import unknownComp from "../../components/tools/unknown.vue";
import {rankWith} from "@jsonforms/core";

export class UnknownTool extends AbstractTool implements ToolInterface {

    importer = () => unknownComp;
    tester = rankWith(-1, () => false);

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        return {};
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: {},
            uischema: {},
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new UnknownTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            hideToolAtBar: true,
        }
    }
}


export const unknownTool = new UnknownTool('unknown');
