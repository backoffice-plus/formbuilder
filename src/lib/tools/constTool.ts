import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {resolveSchema} from "../formbuilder";
import jsonForms from "./schema/const.form.json";
import jsonFormsSchema from "./schema/const.schemaBuilder.form.json";
import constComponent from "../../components/tools/const.vue";
import {rankWith} from "@jsonforms/core";
import type {TesterContext} from "@jsonforms/core/src/testers/testers";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core/src/models";
import {ControlTool} from "./controlTool";
import _ from "lodash";
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";

export class ConstTool extends ControlTool {

    importer = () => constComponent;
    tester = rankWith(4, (uischema: UISchemaElement, schema: JsonSchema, context: TesterContext) => _.isObject(schema) && "const" in schema);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        if(!('const' in this.schema)) {
            this.schema.const = '';//undefined;
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = super.optionDataPrepare(context);

        _.merge(
            data,
            subschemas.prepareOptionDataConst(context, this.schema, this.uischema),
        )

        if(this.parentTool instanceof SchemaTool) {
            data._asSchemaChild = true;
        }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        subschemas.setOptionDataConst(this.schema, this.uischema, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let currentJsonForm = jsonForms
        if('schema' === context.builder) {
            currentJsonForm = jsonFormsSchema as any;
        }

        console.log("ConsTool",this.parentTool);

        return {
             schema: await resolveSchema(currentJsonForm.schema),
             uischema: await resolveSchema(currentJsonForm.uischema),
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
