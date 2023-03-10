import {AbstractTool} from "./AbstractTool";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "./index";
import unknownComp from "../../components/tools/unknown.vue";
import {rankWith} from "@jsonforms/core";

export class UnknownTool extends AbstractTool implements ToolInterface {

    importer = () => unknownComp;
    tester = rankWith(-1, () => false);

    optionDataPrepare(context: ToolContext): Record<string, any> {
        return {};
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
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
