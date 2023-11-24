import {rankWith, uiTypeIs} from "@jsonforms/core";
import buttonComp from "../../components/tools/button.component.vue";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import {schema, uischema} from "./schema/button.form.json";
import {resolveSchema} from "../formbuilder";
import * as subschemas from "./subschemas";

export class ButtonTool extends AbstractTool implements ToolInterface {
    importer = () => buttonComp;
    tester = rankWith(1, uiTypeIs('Button'));

    constructor(uischemaType: string = 'Unknown') {
        super(uischemaType);
        this.schema = undefined;
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        return {
            text: this.uischema.text,
            i18n: this.uischema.i18n,
            scope: this.uischema.scope,
            scope_value: this.uischema.scope_value,
            options: this.uischema.options ?? {},
            ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.text = data.text;
        this.uischema.i18n = data.i18n;
        this.uischema.scope = data.scope;
        this.uischema.scope_value = data.scope_value;
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
        return new ButtonTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Control',
            icon: 'mdi:button-pointer',
        }
    }
}

export const buttonTool = new ButtonTool('Button');
