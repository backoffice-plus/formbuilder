import type {JsonSchema, Scoped} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import scopeComp from "../../components/tools/scope.component.vue";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import {resolveSchema} from "../formbuilder";
import {findAllScopablePaths, findAllScopablePathsBySchema} from "../schemaUtil";
import * as subschemas from "@/lib/tools/subschemas";
import {UiOptions} from "@/lib";
import {schema, uischema} from "@/tools/ScopeTool";
import {VerticalLayout} from "@/lib/tools/layoutTool";
import {JsonFormsUISchema} from "../models";
import * as _ from "lodash-es";
import {ControlTool} from "@/lib/tools/controlTool";

export class ScopeTool extends ControlTool {
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
        const data = super.optionDataPrepare(context)

        return {
            ...data,
            uischema: {
                scope: this.uischema.scope
            },
            ...subschemas.prepareOptionOperation(context, this),
        }
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context,data);

        this.uischema.scope = data.uischema.scope
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema, undefined, this, context),
            uischema: await resolveSchema(uischema),
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
