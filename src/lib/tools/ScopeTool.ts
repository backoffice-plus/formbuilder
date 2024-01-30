import type {JsonSchema, Scoped} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import scopeComp from "../../components/tools/scope.component.vue";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import jsonForms from "./schema/scope.form.json";
import {resolveSchema} from "../formbuilder";
import {findAllScopablePaths, findAllScopablePathsBySchema} from "../schemaUtil";
import * as subschemas from "@/lib/tools/subschemas";

export class ScopeTool extends AbstractTool implements ToolInterface {
    importer = () => scopeComp;
    tester = rankWith(0,
        and(
            uiTypeIs('Control'),
            (uischema, schema) => "scope" in uischema
        )
    )

    constructor() {
        super('Control')
        this.uischema.scope = '#';
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = {
            uischema: {
                scope: this.uischema.scope,
            },
            ...subschemas.prepareOptionDataLabel(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            ...subschemas.prepareOptionUiOptions(context, this),
            ...subschemas.prepareOptionOperation(context, this),

        } as any;

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.scope = data.uischema.scope

        subschemas.setOptionDataLabel(this.schema, this.uischema, data);
        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataUiOptions(context, this, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        const resolvedSchema = await resolveSchema(JSON.parse(JSON.stringify(context.baseSchemaTool?.schema)));

        const scopeResolver = (ref: URI) => {
            if ('scopeTool.scopes' === String(ref)) {
                //const allScopes = findAllScopablePaths(context.baseSchemaTool, '#');
                const allScopes = [
                    '#',
                    ...findAllScopablePathsBySchema(resolvedSchema, '#'),
                ]

                return {
                    type: 'string',
                    title: 'Select scope',
                    enum: allScopes ?? ['']
                } as JsonSchema
            }
            return undefined;
        }

        return {
            schema: await resolveSchema(jsonForms.schema, scopeResolver, this, context),
            uischema: await resolveSchema(jsonForms.uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new ScopeTool();
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Control',
            icon: 'mdi:pound-box',
        }
    }

    handelUiEventOnAdded(e:any):void {
        "targetTool" in e && (e.targetTool = undefined);
    }
    handelOnClone(e:any):void {
        "isCloneable" in e && (e.isCloneable = true);
    }

    generateJsonSchema(): JsonSchema|undefined {
        return undefined
    }
}

export const scopeTool = new ScopeTool();
