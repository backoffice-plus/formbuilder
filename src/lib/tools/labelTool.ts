import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {AbstractTool} from "./AbstractTool";
import type {JsonFormsInterface, ToolInterface} from "../../index";
import {resolveSchema} from "../../index";
import labelComp from "../../components/tools/label.vue";
import {prepareOptionDataRule, schema, setOptionDataRule, uischema} from "./schema/toolLabel";

export class LabelTool extends AbstractTool implements ToolInterface {

    importer = () => labelComp;
    tester = rankWith(1, uiTypeIs('Label'));

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        return {
            text: this.uischema.text,
            i18n: this.uischema.i18n,
            options: this.uischema.i18n ?? {},
            ...prepareOptionDataRule(this.schema, this.uischema),
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        this.uischema.text = data.text;
        this.uischema.i18n = data.i18n;
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
