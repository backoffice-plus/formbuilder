import type {JsonFormsInterface, ToolInterface} from "./index";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/toolConst";
import constComponent from "../../components/tools/const.vue";
import {rankWith} from "@jsonforms/core";
import type {TesterContext} from "@jsonforms/core/src/testers/testers";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core/src/models";
import {ControlTool} from "./controlTool";


export class ConstTool extends ControlTool {

    importer = () => constComponent;
    tester = rankWith(1, (uischema: UISchemaElement, schema: JsonSchema, context: TesterContext) => undefined !== schema?.const);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.const ??= '';
    }

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        const data = super.optionDataPrepare(tool);

        data.const = this.schema.const ?? '';

        return data;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        super.optionDataUpdate(tool, data);

        this.schema.const = data.const;

        delete this.schema.type; //no type for const, right?!
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new ConstTool();
    }

    toolbarOptions(): Record<string, any> {
        return {
            //title: this.uischema.label,
            icon: 'mdi:alpha-c-box-outline',
            //icon: 'mdi:alpha-c-box',
        }
    }
}

export const constTool = new ConstTool();
