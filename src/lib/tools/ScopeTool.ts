import type {JsonSchema, Scoped} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import scopeComp from "../../components/tools/scope.component.vue";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import jsonForms from "./schema/scope.form.json";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {fromPropertyToScope} from "../normalizer";

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

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.uischema.scope = data.scope
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        //:TODO find all scopes
        // const definitionResolver = (ref: URI) => {
        //     if ('referenceTool.definitions' === String(ref)) {
        //         const s = context.rootSchema;
        //         const definitionPaths = s?.definitions && Object.keys(s?.definitions).map(key => '#/definitions/' + key);
        //
        //         return {
        //             type: 'string',
        //             title: 'Select',
        //             enum: definitionPaths ?? ['']
        //         } as JsonSchema
        //     }
        //     return undefined;
        // }

        return {
            schema: await resolveSchema(jsonForms.schema), //definitionResolver
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
}

export const scopeTool = new ScopeTool();
