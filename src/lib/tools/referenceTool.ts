import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import referenceComp from "../../components/tools/reference.vue";
import type {JsonFormsInterface, ToolInterface} from "./index";

import {AbstractTool} from "./AbstractTool";
import {schema, uischema} from "./schema/reference.schema";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {useJsonforms} from "../../composable/jsonforms";

export class ReferenceTool extends AbstractTool implements ToolInterface {
    importer = () => referenceComp;
    tester = rankWith(1,
        and(
            uiTypeIs('Control'),
            (uischema, schema) => undefined !== schema?.$ref
        )
    )

    optionDataPrepare(): Record<string, any> {
        const data = {} as any;

        data.propertyName = this.propertyName;

        if (undefined !== this.schema.$ref) {
            data._reference = this.schema.$ref
        }

        return data;
    }

    optionDataUpdate(data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)

        if (undefined !== data._reference) {
            this.schema.$ref = data._reference;
        }
    }

    async optionJsonforms(): Promise<JsonFormsInterface | undefined> {
        const definitionResolver = (ref: URI) => {
            if ('referenceTool.definitions' === String(ref)) {
                const {schema: s} = useJsonforms();
                const definitionPaths = Object.keys(s.value?.definitions ?? []).map(key => '#/definitions/' + key);
                return {
                    type: 'string',
                    title: 'Select',
                    enum: definitionPaths
                } as JsonSchema
            }
            return undefined;
        }
        return {
            schema: await resolveSchema(schema, definitionResolver),
            uischema: await resolveSchema(uischema),
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
