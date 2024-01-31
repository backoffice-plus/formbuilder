import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import referenceComp from "../../components/tools/reference.vue";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import {BuilderMode, createResolvedJsonForms, resolveSchema} from "../formbuilder";
import * as subschemas from "@/lib/tools/subschemas";
import {schema, uischemaModeBoth, uischemaModeSchema, uischemaModeUi} from "@/tools/RefTool";
import {ControlTool} from "@/lib/tools/controlTool";
import {UiOptions} from "@/lib";
import {BuilderModeType} from "../models";

export class ReferenceTool extends ControlTool {
    importer = () => referenceComp;
    tester = rankWith(1,
        and(
            uiTypeIs('Control'),
            (uischema, schema) => undefined !== schema?.$ref
        )
    )
    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.$ref ??= '';
    }

    availableUiOptions():UiOptions|undefined {
        return {
            readonly: {type:"boolean", default:false},
            showUnfocusedDescription: {type:"boolean", default:false},
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        /**
         * :TODO no need to load schema data (like type, title, etc...) only $ref & uischema stuff
         */
        const data:any = super.optionDataPrepare(context);

        if (undefined !== this.schema.$ref) {
            data._reference = this.schema.$ref
        }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        /**
         * :TODO no need to update schema data (like type, title, etc...) only $ref & uischema stuff
         */
        super.optionDataUpdate(context, data);

         this.schema = {
             $ref: data._reference ?? ''
         }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        let uischemas:Record<BuilderModeType, any> = {
            [BuilderMode.BOTH]:uischemaModeBoth,
            [BuilderMode.SCHEMA]:uischemaModeSchema,
            [BuilderMode.UI]:uischemaModeUi,
        };

        const definitionResolver = (ref: URI) => {
            if ('referenceTool.definitions' === String(ref)) {
                const s = context.rootSchema;
                const definitionPaths = s?.definitions && Object.keys(s?.definitions).map(key => '#/definitions/' + key);

                return {
                    type: 'string',
                    title: 'Select',
                    enum: definitionPaths ?? ['']
                } as JsonSchema
            }
            return undefined;
        }

        return createResolvedJsonForms([
            resolveSchema(schema, definitionResolver, this, context),
            resolveSchema(uischemas[context.builderMode ?? BuilderMode.BOTH])
        ]);
    }

    clone(): ToolInterface {
        return new ReferenceTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Control',
            icon: 'mdi:link-box-variant',
        }
    }
}

export const referenceTool = new ReferenceTool('Control');
