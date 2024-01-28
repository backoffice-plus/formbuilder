import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/group.form.json";
import * as _ from 'lodash-es';
import {VerticalLayout} from "./layoutTool";
import * as subschemas from "./subschemas";


export class GroupTool extends VerticalLayout {


    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        subschemas.setOptionDataUiOptions(context, this, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema,undefined, this, context),
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
