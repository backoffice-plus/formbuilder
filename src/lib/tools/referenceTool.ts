import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import referenceComp from "../../components/tools/reference.vue";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import jsonForms from "./schema/reference.form.json";
import {resolveSchema} from "../formbuilder";
import * as subschemas from "@/lib/tools/subschemas";

export class ReferenceTool extends AbstractTool implements ToolInterface {
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

    optionDataPrepare(context: ToolContext): Record<string, any> {
        let uidata = {};
        const isUischema = 'uischema' === context?.builder;
        if(isUischema) {
            uidata = {
                ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
                ...subschemas.prepareOptionUiOptions(context, this),
            }
        }

        const data = {
            propertyName: this.propertyName,
            _isProperty: 'object' === this.edge.schemaParent?.schema?.type,
            ...uidata
        } as any;


        if (undefined !== this.schema.$ref) {
            data._reference = this.schema.$ref
        }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        const isUischema = 'uischema' === context?.builder;

        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);

        if (undefined !== data._reference) {
            this.schema.$ref = data._reference;
        }

        if(isUischema) {
            subschemas.setOptionDataRule(this.schema, this.uischema, data);
            subschemas.setOptionDataUiOptions(context, this, data);
        }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
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
        return {
            schema: await resolveSchema(jsonForms.schema, definitionResolver, this, context),
            uischema: await resolveSchema(jsonForms.uischema),
        } as JsonFormsInterface
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
