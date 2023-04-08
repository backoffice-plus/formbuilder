import _ from "lodash";
import type {ToolInterface} from "./models";
import {unknownTool} from "./tools/unknownTool";
import type {JsonSchema, Scoped, UISchemaElement} from "@jsonforms/core";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import {normalizeScope} from "./normalizer";
import {cloneEmptyTool, cloneToolWithSchema} from "./toolCreation";
import {findAllProperties} from "./formbuilder";

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
            return !uiSchemaType || uiSchemaType === 'Control' || uiSchemaType === 'Unknown'
        })
    }

    findLayoutTools(): ToolInterface[] {
        return this._tools.filter((tool: ToolInterface) => {
            const uiSchemaType = tool.uischema.type;
            const hasElements = _.isObject(tool.uischema) && 'elements' in tool.uischema;
            return (uiSchemaType && hasElements) || uiSchemaType !== 'Control' && uiSchemaType !== 'Unknown'
        })
    }

    findLayoutToolByUiType = (uiType: string): ToolInterface | undefined => {
        return this.findLayoutTools().find((tool: ToolInterface) => tool?.uischema?.type === uiType)
    }

    findMatchingToolAndClone = (schema: any, itemSchema: any, itemUischema: any): ToolInterface => {
        return cloneEmptyTool(this.findMatchingTool(schema, itemSchema, itemUischema), itemSchema);
    }

    findMatchingTool = (schema: any, itemSchema: JsonSchema, itemUischema: any): ToolInterface => {
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

            /**
             * if no tool was found, check and guess type and try again
             */
            if(_.isObject(itemSchema) && undefined === itemSchema?.type){
                itemSchema.type = this.guessType(itemSchema);
                if(itemSchema.type) {
                    switch (itemSchema.type) {
                        case 'array':
                            if(undefined === itemSchema.items) {
                                itemSchema.items = {};
                            }
                            break;
                    }
                    return this.findMatchingTool(schema, itemSchema, itemUischema);
                }
            }

            return unknownTool;
        }
        return toolWithScore.tool;
    };

    guessType(schema: JsonSchema):string|undefined {

        //@see https://json-schema.org/understanding-json-schema/reference/index.html
        const properties = {
            string:['minLength','maxLength', 'pattern', 'enum'],
            array: ['contains','minContains', 'maxContains','minItems','maxItems','uniqueItems'],
            number:['minimum','maximum','exclusiveMinimum','exclusiveMaximum','multipleOf'],
            object:['properties','patternProperties'],
        } as Record<string, string[]>;
        const propKeys = Object.keys(properties);
        const scores = {} as Record<string, number>;
        Object.keys(schema).forEach(key => {
            propKeys.forEach(propKey => {
                if(properties[propKey].includes(key)) {
                    if(undefined === scores[propKey]) {
                        scores[propKey] = 0;
                    }
                    scores[propKey]++
                }
            })
        })

        const scoreItems = Object.keys(scores).map((key:string) => {return {type:key,score:scores[key]}})
        const maxItem = _.maxBy(scoreItems, (i) => i.score)

        return maxItem?.type;
    }

    findBaseTool(schema: JsonSchema, uischema: ControlElement | Layout | UISchemaElement | Scoped | any): ToolInterface {

        if (undefined === schema) {
            throw "schema is undefined"
        }
        if (undefined === uischema || null === uischema || false === uischema) {
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

    findReadonlyTools(schema:JsonSchema): ToolInterface[] {

        const allProps = findAllProperties(schema);

        return Object.keys(allProps)?.map(name => {

            const itemSchema = allProps[name];
            const itemUischema = {type: 'Control', scope: '#'};

            const clone = this.findMatchingToolAndClone({}, itemSchema, itemUischema);
            clone.propertyName = name;

            return clone;
        });
    }


    getTypedTools(): Record<'control'|'layout'|'unknown',Array<ToolInterface>> {
        const typedTools = {
            control: [] as ToolInterface[],
            layout: [] as ToolInterface[],
            unknown: [] as ToolInterface[],
        };

        this.tools.forEach(tool => {

            const hasUischema = _.isObject(tool.uischema);
            const uiSchemaType = hasUischema && tool.uischema.type;
            const hasElements = uiSchemaType && hasUischema && 'elements' in tool.uischema;
            const isControlType = uiSchemaType === 'Control';
            const isUnknownType = !isControlType && uiSchemaType === 'Unknown';

            const isControl = !uiSchemaType || isControlType || isUnknownType;
            const isLayout = (uiSchemaType && hasElements) || !isControlType && !isUnknownType

            if(tool.toolbarOptions()?.hideToolAtBar) {
                return;
            }

            if(isControl) {
                typedTools.control.push(tool)
            }
            else if(isLayout) {
                typedTools.layout.push(tool)
            }
            else {
                typedTools.unknown.push(tool)
            }
        })

        return typedTools;
    }

}
