import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/group.form.json";
import _ from "lodash";
import {VerticalLayout} from "./layoutTool";
import * as subschemas from "./subschemas";


export class GroupTool extends VerticalLayout {

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = {};

        _.merge(
            data,
            subschemas.prepareOptionDataLabel(context, this.schema, this.uischema),
            subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
        )
        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.options = data.options ?? {};

        subschemas.setOptionDataLabel(this.schema, this.uischema, data);
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
        return new GroupTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: this.uischema.label,
            icon: 'mdi:application-outline',
        }
    }
}

export const groupTool = new GroupTool('Group');
