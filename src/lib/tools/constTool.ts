import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {BuilderMode, createResolvedJsonForms, resolveSchema} from "../formbuilder";
import constComponent from "../../components/tools/const.vue";
import {rankWith} from "@jsonforms/core";
import type {TesterContext} from "@jsonforms/core";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {ControlTool} from "./controlTool";
import * as _ from 'lodash-es';
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";
import {UiOptions} from "@/lib";
import {schema, uischemaModeBoth, uischemaModeSchema, uischemaModeUi} from "@/tools/ConstTool";
import {BuilderModeType} from "../models";

export class ConstTool extends ControlTool {

    importer = () => constComponent;
    tester = rankWith(4, (uischema: UISchemaElement, schema: JsonSchema, context: TesterContext) => _.isObject(schema) && "const" in schema);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        if(!('const' in this.schema)) {
            this.schema.const = '';//undefined;
        }
    }
    availableUiOptions():UiOptions|undefined {
        return {
            readonly: {type:"boolean", default:false},
            showUnfocusedDescription: {type:"boolean", default:false},
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        return {
            ...super.optionDataPrepare(context),
            ...subschemas.prepareOptionDataConst(context, this.schema, this.uischema),
        };
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        subschemas.setOptionDataConst(this.schema, this.uischema, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let uischemas:Record<BuilderModeType, any> = {
            [BuilderMode.BOTH]:uischemaModeBoth,
            [BuilderMode.SCHEMA]:uischemaModeSchema,
            [BuilderMode.UI]:uischemaModeUi,
        };

        return createResolvedJsonForms([
            resolveSchema(schema, undefined, this, context),
            resolveSchema(uischemas[context.builderMode ?? BuilderMode.BOTH])
        ]);
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
