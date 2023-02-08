import type {JsonFormsInterface, ToolInterface} from "../../src";
import {prepareOptionDataRule, setOptionDataRule, resolveSchema, AbstractTool} from "../../src";
import htmlToolComponent from "./htmlToolComponent.vue";
import htmlRenderer from "./htmlRenderer.vue";
import {entry as htmlControlRenderer} from "./htmlControlRenderer.vue";
import {schema, uischema} from "./htmlToolSchema";


export class HtmlTool extends AbstractTool implements ToolInterface {

    importer = () => htmlToolComponent;
    optionJsonformsRenderer = () => [htmlControlRenderer];
    clone = (): ToolInterface => new HtmlTool(this.uischema.type);
    tester = htmlRenderer.tester;

    optionDataPrepare(tool: ToolInterface): Record<string, any> {

        //init data
        if (this.uischema?.options?.body) {
            this.uischema.options = {body: '<code>HTML Tool</code>'};
        }

        return {
            options: this.uischema.options ?? {},
            ...prepareOptionDataRule(tool.schema, uischema),
        };
    };

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        this.uischema.options = data.options ?? {};

        setOptionDataRule(this.schema, this.uischema, data);
    };

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        }
    };
}

export const htmlTool = new HtmlTool('Html')
