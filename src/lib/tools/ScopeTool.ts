import type {JsonSchema, Scoped} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import scopeComp from "../../components/tools/scope.component.vue";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import jsonForms from "./schema/scope.form.json";
import {resolveSchema} from "../formbuilder";
import {fromPropertyToScope} from "../normalizer";
import {findAllScopablePaths} from "../schemaUtil";

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
        const data = {} as any;

        data.scope = this.uischema.scope;
        if (undefined !== this.uischema.scope) {
            data._scope = this.uischema.scope
        }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.scope = data.scope

        if (undefined !== data._scope) {
            this.uischema.scope = data._scope;
        }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        const scopeResolver = (ref: URI) => {
            if ('scopeTool.scopes' === String(ref)) {
                const allScopes = findAllScopablePaths(context.baseSchemaTool, '#');

                return {
                    type: 'string',
                    title: 'Select',
                    enum: allScopes ?? ['']
                } as JsonSchema
            }
            return undefined;
        }

        return {
            schema: await resolveSchema(jsonForms.schema, scopeResolver),
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
