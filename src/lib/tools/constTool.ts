import type {JsonFormsInterface, ToolContext, ToolInterface} from "./index";
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

        if(!('const' in this.schema)) {
            this.schema.const = '';//undefined;
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = super.optionDataPrepare(context);

        data.const = this.schema.const;
        data._parse = undefined;
        if(null === data.const) {
            data.const = 'null';
            data._parse = 'null';
        }
        else if(['array','object'].includes(typeof data.const)) {
            data.const = JSON.stringify(data.const);
            data._parse = 'json';
        }


        data.title = this.schema.title;

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        this.schema.const = data.const;
        this.schema.title = data.title;

        if('string' === typeof data.const) {
            if('json' === data._parse && data.const.match(/^[\[{].*[\]}]$/)) {
                try {
                    const json = JSON.parse(data.const)
                    this.schema.const = json;
                }
                catch (e) {}
            }
            else if('null' === data._parse && 'null' === data.const) {
                this.schema.const = null;
            }
        }

        delete this.schema.type; //no type for const, right?!
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
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
