import type {JsonFormsInterface, ToolContext, ToolInterface} from "./index";
import {resolveSchema} from "../formbuilder";
import {
    prepareOptionDataLabel,
    prepareOptionDataRule,
    schema,
    setOptionDataLabel,
    setOptionDataRule,
    uischema
} from "./schema/toolGroup";
import _ from "lodash";
import {VerticalLayout} from "./layoutTool";


export class GroupTool extends VerticalLayout {

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = {};

        _.merge(
            data,
            prepareOptionDataLabel(context, this.schema, this.uischema),
            prepareOptionDataRule(context, this.schema, this.uischema),
        )
        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.options = data.options ?? {};

        setOptionDataLabel(this.schema, this.uischema, data);
        setOptionDataRule(this.schema, this.uischema, data);
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
