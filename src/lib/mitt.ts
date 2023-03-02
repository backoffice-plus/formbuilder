import mitt from 'mitt'
import type {JsonFormsUISchema, ToolInterface} from "./tools";
import type {JsonSchema} from "@jsonforms/core";
type Events = {
    formBuilderModal: any,
    formBuilderUpdated: any,
    //formBuilderSchemaUpdated: any,

    afterOptionJsonforms: any,
};
export const emitter = mitt<Events>();

export type EventAfterOptionJsonforms = {
    tool: ToolInterface,
    schema: JsonSchema,
    uischema: JsonFormsUISchema,
}
