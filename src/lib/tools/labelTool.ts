import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import {AbstractTool} from "./AbstractTool";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {prepareOptionUiOptions, resolveSchema} from "../../index";
import labelComp from "../../components/tools/label.vue";
import {schema, uischema} from "./schema/label.form.json";
import * as subschemas from "./subschemas";

export class LabelTool extends AbstractTool implements ToolInterface {

    importer = () => labelComp;
    tester = rankWith(1, uiTypeIs('Label'));

    optionDataPrepare(context: ToolContext): Record<string, any> {
        return {
            uischema: {
                text: this.uischema.text,
                i18n: this.uischema.i18n,
            },
            ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            ...subschemas.prepareOptionUiOptions(context, this),
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.text = data.uischema.text;
        this.uischema.i18n = data.uischema.i18n;

        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataUiOptions(context, this, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema,undefined, this, context),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new LabelTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Label',
            icon: 'mdi:tag-text',
        }
    }
}

export const labelTool = new LabelTool('Label')
