import type {Ref} from 'vue'
import {ref} from 'vue'
import type {ToolInterface} from "../lib/models";
import _ from "lodash";
import {unknownTool} from "../lib/tools/unknownTool";

const tools: Ref<Array<ToolInterface>> = ref([]);

export function useTools() {

    const registerTool = (tool: ToolInterface): void => {
        tools.value.push(tool);

    };
    const registerTools = (tools: ToolInterface[]): void => {
        tools.forEach(tool => registerTool(tool));
    };

    const getControlTools = (): Array<ToolInterface> => {
        return tools.value.filter((tool: ToolInterface) => {
            const uiSchemaType = tool.props.jsonForms.uischema.type;
            return uiSchemaType && uiSchemaType === 'Control'
        })
    }
    const getLayoutTools = (): Array<ToolInterface> => {
        return tools.value.filter((tool: ToolInterface) => {
            const uiSchemaType = tool.props.jsonForms.uischema.type;
            return uiSchemaType && uiSchemaType !== 'Control'
        })
    }

    const findLayoutToolByUiType = (uiType: string): ToolInterface | undefined => {
        return getLayoutTools().find((tool: ToolInterface) => tool.props.jsonForms.uischema.type === uiType)
    }

    const unregisterAllTools = (): void => {
        tools.value = [];
    };
    const unregisterToolByType = (type: string): void => {
        tools.value = tools.value.filter((tool: ToolInterface) => tool.props.toolType !== type);
    }

    const findMatchingTool = (schema: any, itemSchema: any, itemUischema: any): ToolInterface => {
        const toolsWithScore = tools.value.map((tool: ToolInterface, index) => {
            return {
                tool: tool,
                score: (tool?.tester && tool.tester(itemUischema, itemSchema, {rootSchema: schema, config: null})) ?? -1,
            }
        });

        const toolWithScore = _.maxBy(toolsWithScore, (i) => i.score)
        if (!toolWithScore?.tool || -1 === toolWithScore?.score) {
            return unknownTool;
        }
        return toolWithScore.tool;
    };

    return {
        tools,
        registerTool,
        registerTools,
        unregisterAllTools,
        unregisterToolByType,
        getControlTools,
        getLayoutTools,
        findLayoutToolByUiType,
        findMatchingTool,
    };
}
