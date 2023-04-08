import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {AbstractTool} from "./AbstractTool";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {resolveSchema} from "../../index";
import refComp from "../../components/tools/layoutReference.vue";
import jsonForms from "./schema/layoutref.form.json";

export class LayoutRefTool extends AbstractTool implements ToolInterface {

    importer = () => refComp;
    tester = rankWith(2, uiTypeIs('LayoutRef'));


    constructor(uischemaType: string = 'LayoutRef') {
        super(uischemaType);

        this.uischema.$ref ??= '';
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = {} as any;

        if (undefined !== this.uischema.$ref) {
            data._reference = this.uischema.$ref
        }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {

        if (undefined !== data._reference) {
            this.uischema.$ref = data._reference;
        }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(jsonForms.schema),
            uischema: await resolveSchema(jsonForms.uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new LayoutRefTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'LayoutRef',
            icon: 'mdi:link-box-variant',
            hideToolAtBar: true,
        }
    }
}

export const layoutRefTool = new LayoutRefTool('LayoutRef')
