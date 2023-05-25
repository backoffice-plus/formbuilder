import {rankWith} from "@jsonforms/core";
import type {Layout} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {AbstractTool} from "./AbstractTool";
import flexArea from "../../components/tools/flexArea.vue";
import {resolveSchema} from "../formbuilder";
import type {JsonFormsInterface, JsonFormsUISchema, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {schema, uischema} from "./schema/layout.form.json";
import * as subschemas from "./subschemas";
import {getPlainProperty, getRequiredFromSchema, normalizePath, normalizeScope} from "../normalizer";
import _ from "lodash";
import {cloneToolWithSchema} from "../toolCreation";
import {unknownTool} from "./unknownTool";

export class VerticalLayout extends AbstractTool implements ToolInterface {

    importer = () => flexArea;
    tester = rankWith(1, uiTypeIs(this.uischema.type));

    constructor(uischemaType: string = 'VerticalLayout') {
        super(uischemaType);

        this.uischema = {
            type: uischemaType,
            elements: []
        } as Layout;
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        return {
            options: this.uischema?.options,
            uischemaType: this.uischema.type,
            ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        if (data.uischemaType) {
            this.uischema.type = data.uischemaType;
        }

        this.uischema.options = data.options ?? {};

        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataStyles(this.schema, this.uischema, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new VerticalLayout(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        const isVertical = 'VerticalLayout' === this.uischema.type;
        return {
            title: this.uischema.type,
            icon: isVertical ? 'mdi:land-rows-horizontal' : 'mdi:land-rows-vertical',
        }
    }


    initChilds(toolFinder: ToolFinderInterface): ToolInterface[] {
        const tools = [] as any;

        //for moving existing tools to another list
        if(this.childs?.length) {
            return this.childs;
        }

        this.uischema?.elements?.forEach((itemUischema: any) => {
            let clone;

            //const isLayout = undefined !== itemUischema.elements
            const isScoped = itemUischema.scope;

            if(isScoped) {
                const propertyPath = normalizeScope(itemUischema.scope);
                const itemSchema = _.get(this.schema, propertyPath);

                clone = cloneToolWithSchema(toolFinder.findMatchingTool(this.schema, itemSchema, itemUischema), itemSchema, itemUischema)
                clone.propertyName = normalizePath(propertyPath);

                //required
                const required = getRequiredFromSchema(clone.propertyName, this.schema);
                if (required?.includes(getPlainProperty(clone.propertyName))) {
                    clone.isRequired = true;
                }
            }
            else {
                clone = cloneToolWithSchema(toolFinder.findLayoutToolByUiType(itemUischema.type) ?? unknownTool, this.schema, itemUischema);
            }

            tools.push(clone);
        });

        //:TODO remove
        //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

        return tools;
    }


    generateUiSchema(): JsonFormsUISchema | undefined {
        const uischema = _.cloneDeep(this.uischema);
        if(this.childs.length) {
            uischema.elements = this.childs
                .filter((t:ToolInterface) => "scope" !== t.uischema.type)
                .map((t: ToolInterface) => t.generateUiSchema())
                .filter((uischema:any) => uischema)
        }
        if(_.isEmpty(uischema.options)) {
            delete uischema.options;
        }
        return uischema;
    }
}


export class HorizontalLayout extends VerticalLayout {
    tester = rankWith(1, uiTypeIs(this.uischema.type));

    clone(): ToolInterface {
        return new HorizontalLayout(this.uischema.type);
    }
}

export const verticalLayout = new VerticalLayout();
export const horizontalLayout = new HorizontalLayout('HorizontalLayout');


