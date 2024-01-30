import * as _ from 'lodash-es'
import type {ToolFinderInterface, ToolInterface} from "./models";
import {unknownTool} from "./tools/unknownTool";
import type {JsonSchema, Scoped, UISchemaElement} from "@jsonforms/core";
import type {ControlElement, Layout} from "@jsonforms/core";
import {normalizeScope} from "./normalizer";
import {cloneEmptyTool, cloneToolWithSchema} from "./toolCreation";
import {findAllProperties} from "./formbuilder";
import {ScopeTool} from "./tools/ScopeTool";
import {TypedTools} from "./models";

export type UiOptions = Record<string, JsonSchema>
export type UiOptionsByType = Record<string, UiOptions>
export class ToolFinder implements ToolFinderInterface {

    private readonly _tools = [] as ToolInterface[];
    private readonly _uiOptions = {} as UiOptionsByType;

    constructor(tools: ToolInterface[], uiOptions?:UiOptionsByType) {
        this._tools = tools;
        this._uiOptions = uiOptions ?? {};
    }

    get tools(): ToolInterface[] {
        return this._tools;
    }

    // findControlTools(): ToolInterface[] {
    //     return this._tools.filter((tool: ToolInterface) => {
    //         const hasUischema = _.isObject(tool.uischema);
    //         const uiSchemaType = hasUischema && tool.uischema.type;
    //         return !uiSchemaType || uiSchemaType === 'Control' || uiSchemaType === 'Unknown'
    //     })
    // }

    // findLayoutTools(): ToolInterface[] {
    //     return this._tools.filter((tool: ToolInterface) => {
    //         const uiSchemaType = tool.uischema.type;
    //         const hasElements = _.isObject(tool.uischema) && 'elements' in tool.uischema;
    //         return (uiSchemaType && hasElements) || uiSchemaType !== 'Control' && uiSchemaType !== 'Unknown'
    //     })
    // }

    getUiOptions = (uischema:string) => {
        return this._uiOptions?.[uischema]
    }

    findLayoutToolByUiType = (uiType: string): ToolInterface | undefined => {
        return this.getTypedTools().layout.find((tool: ToolInterface) => tool?.uischema?.type === uiType)
    }

    findMatchingToolAndClone = (schema: JsonSchema, itemSchema: JsonSchema, itemUischema: any, propertyName?:string, fromTools?:ToolInterface[]): ToolInterface => {
        return cloneEmptyTool(this.findMatchingTool(schema, itemSchema, itemUischema, fromTools), itemSchema, propertyName);
    }

    findMatchingTool = (schema: any, itemSchema: JsonSchema, itemUischema: any, fromTools?:ToolInterface[]): ToolInterface => {

        const tools = fromTools ?? this._tools;
        const toolsWithScore = tools.map((tool: ToolInterface, index) => {
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

        /**
         * if `enum: [true]`, then type=boolean
         */
        if(schema.enum?.length) {
            const types = new Set<string>(schema.enum.map(value => typeof value))
            return Array.from(types)[0];
        }

        //@see https://json-schema.org/understanding-json-schema/reference/index.html
        const properties = {
            string:['minLength','maxLength', 'pattern'],
            array: ['contains','minContains', 'maxContains','minItems','maxItems','uniqueItems'],
            number:['minimum','maximum','exclusiveMinimum','exclusiveMaximum','multipleOf'],
            object:['properties','patternProperties', 'required'],
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
            throw Error("schema is undefined")
        }
        if (undefined === uischema || null === uischema || false === uischema) {
            throw Error("uischema is undefined")
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
                    //console.error("scope=# is not supported",itemSchema, uischema)
                    return cloneToolWithSchema(new ScopeTool(), itemSchema, uischema);
                    // const props = schema.properties as any;
                    // const propKeys = Object.keys(props);
                    // itemSchema = propKeys[0] && props[propKeys[0]] as any
                } else {
                    throw Error(":TODO please explain whats that for?!?!")
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


    getTypedTools(): TypedTools {
        const typedTools:TypedTools = {
            control: [] as ToolInterface[],
            layout: [] as ToolInterface[],
        };

        this.tools.forEach(tool => {

            const hasSchema = _.isObject(tool.schema);
            const hasUischema = _.isObject(tool.uischema);
            const hasUischemaType = hasUischema && tool.uischema.type;
            const hasElements = hasUischemaType && 'elements' in tool.uischema;
            const isScoped = hasUischemaType && 'scope' in tool.uischema;
            const isAutoLayout = isScoped && tool.uischema.scope === '#'; //:TODO are there other scopes?
            const isLabel = tool.uischema.type === 'Label';

            const isLayout = !hasSchema || (hasElements) || isLabel || isAutoLayout;

            if(isLayout) {
                typedTools.layout.push(tool)
            }
            else {
                typedTools.control.push(tool)
            }
        })

        return typedTools;
    }

}
