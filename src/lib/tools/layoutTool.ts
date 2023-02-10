import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {AbstractTool} from "./AbstractTool";
import flexArea from "../../components/tools/flexArea.vue";
import {resolveSchema} from "../formbuilder";
import type {JsonFormsInterface, ToolInterface} from "./index";
import {prepareOptionDataRule, schema, setOptionDataRule, uischema} from "./schema/toolLayout";

export class VerticalLayout extends AbstractTool implements ToolInterface {

    importer = () => flexArea;
    tester = rankWith(1, uiTypeIs(this.uischema.type));

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        return {
            options: this.uischema?.options,
            uischemaType: this.uischema.type,
            ...prepareOptionDataRule(this.schema, this.uischema),
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        if (data.uischemaType) {
            this.uischema.type = data.uischemaType;
        }

        this.uischema.options = data.options ?? {};

        setOptionDataRule(this.schema, this.uischema, data);
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new VerticalLayout(this.uischema.type, this.toolType);
    }

    toolbarOptions(): Record<string, any> {
        const isVertical = 'VerticalLayout' === this.uischema.type;
        return {
            title: this.uischema.type,
            icon: isVertical ? 'mdi:land-rows-horizontal' : 'mdi:land-rows-vertical',
        }
    }
}


export class HorizontalLayout extends VerticalLayout {
    tester = rankWith(1, uiTypeIs(this.uischema.type));

    clone(): ToolInterface {
        return new HorizontalLayout(this.uischema.type, this.toolType);
    }
}

export const verticalLayout = new VerticalLayout('VerticalLayout',);
export const horizontalLayout = new HorizontalLayout('HorizontalLayout');


