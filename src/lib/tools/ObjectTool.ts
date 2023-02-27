import type {JsonFormsInterface, ToolInterface} from "./index";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/object.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/object.schema";
import {rankWith} from "@jsonforms/core";

export class ObjectTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(1, (uischema, schema, context) => {
        return uischema?.type === 'Control' && schema?.type === 'object' && undefined !== schema?.properties
    })
    clone = (): ToolInterface => new ObjectTool(this.uischema.type);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type ??= 'object'
    }

    optionDataPrepare(tool: ToolInterface): Record<string, any> {

        const schema = {
            additionalProperties: tool.schema?.additionalProperties,
            patternProperties: tool.schema?.patternProperties,
        }

        return {
            propertyName: this.propertyName,
            schema: schema,
        } as any;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)

        tool.schema = {
            ...tool.schema,
            ...data.schema
        };
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Object',
            icon: 'mdi:code-braces-box',

        }
    }
}

// @ts-ignore
export const objectTool = new ObjectTool();
