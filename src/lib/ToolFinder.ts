import _ from "lodash";
import type {ToolInterface} from "./tools";
import {unknownTool} from "./tools/unknownTool";
import type {JsonSchema, Scoped, UISchemaElement} from "@jsonforms/core";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import {normalizeScope} from "./normalizer";
import {cloneToolWithSchema} from "./formbuilder";

export class ToolFinder {

    private readonly _tools = [] as ToolInterface[];

    constructor(tools: ToolInterface[]) {
        this._tools = tools;
    }

    get tools(): ToolInterface[] {
        return this._tools;
    }

    findControlTools(): ToolInterface[] {
        return this._tools.filter((tool: ToolInterface) => {
            const uiSchemaType = tool.uischema.type;
            return uiSchemaType && uiSchemaType === 'Control'
        })
    }

    findLayoutTools(): ToolInterface[] {
        return this._tools.filter((tool: ToolInterface) => {
            const uiSchemaType = tool.uischema.type;
            return uiSchemaType && uiSchemaType !== 'Control'
        })
    }

    findLayoutToolByUiType = (uiType: string): ToolInterface | undefined => {
        return this.findLayoutTools().find((tool: ToolInterface) => tool.uischema.type === uiType)
    }

    findMatchingTool = (schema: any, itemSchema: any, itemUischema: any): ToolInterface => {
        const toolsWithScore = this._tools.map((tool: ToolInterface, index) => {
            return {
                tool: tool,
                score: (tool?.tester && tool.tester(itemUischema, itemSchema, {
                    rootSchema: schema,
                    config: null
                })) ?? -1,
            }
        });

        const toolWithScore = _.maxBy(toolsWithScore, (i) => i.score)
        if (!toolWithScore?.tool || -1 === toolWithScore?.score) {
            return unknownTool;
        }
        return toolWithScore.tool;
    };

    findBaseTool(schema: JsonSchema, uischema: ControlElement | Layout | UISchemaElement | Scoped): ToolInterface {

        if (undefined === schema) {
            throw "schema is undefined"
        }
        if (undefined === uischema || null === uischema) {
            throw "uischema is undefined"
        }

        const isLayout = "elements" in uischema
        const isScoped = "scope" in uischema;

        let itemSchema = schema;
        let tool;

        if (isLayout) {
            tool = this.findLayoutToolByUiType(uischema.type) ?? unknownTool;
        }

        //specialcase - some examples use none-Layout-elements as root
        else {
            if (isScoped) {
                //not working well!!!
                if ('#' === uischema?.scope) {
                    console.error("scope=# is not supported")
                    return unknownTool;
                    // const props = schema.properties as any;
                    // const propKeys = Object.keys(props);
                    // itemSchema = propKeys[0] && props[propKeys[0]] as any
                } else {
                    itemSchema = _.get(schema, normalizeScope(uischema.scope));
                }
            }

            tool = this.findMatchingTool(schema, itemSchema, uischema) ?? unknownTool;
        }

        const clone = cloneToolWithSchema(tool, itemSchema, uischema as UISchemaElement);

        return clone;
    };

}
