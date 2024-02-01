import {ToolContext, ToolInterface} from "@/lib/models";
import {findAllScopablePathsBySchema} from "@/lib/schemaUtil";
import {JsonSchema} from "@jsonforms/core";
import {resolveSchema} from "@/lib/formbuilder";

export type SchemaResolverMethod = (ref: URI, tool:ToolInterface, context: ToolContext) => Promise<JsonSchema>


const scopeResolver:SchemaResolverMethod = async (ref: URI, tool: ToolInterface, context: ToolContext) => {

    const resolvedSchema = await resolveSchema(JSON.parse(JSON.stringify(context.baseSchemaTool?.schema)));

    //const allScopes = findAllScopablePaths(context.baseSchemaTool, '#');
    const allScopes = [
        '#',
        ...findAllScopablePathsBySchema(resolvedSchema, '#'),
    ]

    return {
        type: 'string',
        title: 'Select scope',
        enum: allScopes ?? ['']
    }
}

const uioptionsSchemaResolver:SchemaResolverMethod = async (uri: URI, tool: ToolInterface, context: ToolContext) => {

    const toolFinder = context?.fb?.exposed?.toolFinder;
    const uiOptions = {
        ...tool.availableUiOptions(),
        ...toolFinder?.getUiOptions(tool.uischema?.type),
    }

    return {
        type: "object",
        properties: uiOptions,
        additionalProperties: {
            type: ["string", "number", "boolean"]
        }
    }
}

export const schemaResolverMap = {
    "scopeTool.scopes": scopeResolver,
    "uioptions": uioptionsSchemaResolver,
}
