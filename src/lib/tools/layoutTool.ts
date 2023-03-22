import {rankWith} from "@jsonforms/core";
import type {Layout} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {AbstractTool} from "./AbstractTool";
import flexArea from "../../components/tools/flexArea.vue";
import {resolveSchema} from "../formbuilder";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "./index";
import {schema, uischema} from "./schema/layout.schema";
import * as subschemas from "./subschemas";

export class VerticalLayout extends AbstractTool implements ToolInterface {

    importer = () => flexArea;
    tester = rankWith(1, uiTypeIs(this.uischema.type));

    constructor(uischemaType: string = 'VerticalLayout') {
        super(uischemaType);

        this.uischema = {
            type: uischemaType,
            elements: []
        } as Layout;
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        return {
            options: this.uischema?.options,
            uischemaType: this.uischema.type,
            ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        if (data.uischemaType) {
            this.uischema.type = data.uischemaType;
        }

        this.uischema.options = data.options ?? {};

        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataStyles(this.schema, this.uischema, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new VerticalLayout(this.uischema.type);
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
        return new HorizontalLayout(this.uischema.type);
    }
}

export const verticalLayout = new VerticalLayout();
export const horizontalLayout = new HorizontalLayout('HorizontalLayout');


