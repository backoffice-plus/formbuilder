import {rankWith, scopeEndIs} from "@jsonforms/core";
import type {Layout} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";
import {AbstractTool} from "./AbstractTool";
import flexArea from "../../components/tools/flexArea.vue";
import {resolveSchema} from "../formbuilder";
import type {JsonFormsInterface, JsonFormsUISchema, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {schema, uischema} from "./schema/layout.form.json";
import * as subschemas from "./subschemas";
import {getPlainProperty, getRequiredFromSchema, normalizePath, normalizeScope} from "../normalizer";
import * as _ from 'lodash-es';
import {cloneToolWithSchema} from "../toolCreation";
import {unknownTool} from "./unknownTool";
import {toDataPath} from "@jsonforms/core";
import {ScopeTool} from "./ScopeTool";

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


    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const tools = [] as any;

        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }

        this.uischema?.elements?.forEach((itemUischema: any) => {
            let clone;

            //const isLayout = undefined !== itemUischema.elements
            const isScoped = itemUischema.scope;

            if(isScoped) {
                if(baseSchemaTool) {
                    const path = toDataPath(itemUischema.scope);
                    const isDeepPath = path.includes('.');
                    const schemaChild = baseSchemaTool.edge.findChild(path);

                    if(schemaChild) {
                        if(isDeepPath) {
                            clone = new ScopeTool();
                            clone.propertyName = path;
                            clone.uischema = itemUischema;
                        }
                        else {
                            schemaChild.uischema = itemUischema;
                            clone = schemaChild;
                        }
                    }
                    else {
                        clone = new ScopeTool();
                        clone.propertyName = path;
                        clone.uischema = itemUischema;
                        //console.warn("LayoutTool.initChilds","child not find in schema for path",{path})
                    }
                }
                else {
                    //console.warn("LayoutTool.initChilds","NEED baseSchemaTool")
                }
                //baseSchemaTool.edge

                // const propertyPath = normalizeScope(itemUischema.scope);
                // const itemSchema = _.get(this.schema, propertyPath);
                //
                //
                // console.log("LayoutTool","elements.forEach",propertyPath);
                //
                // clone = cloneToolWithSchema(toolFinder.findMatchingTool(this.schema, itemSchema, itemUischema), itemSchema, itemUischema)
                // clone.propertyName = normalizePath(propertyPath);
                //
                // //required
                // const required = getRequiredFromSchema(clone.propertyName, this.schema);
                // if (required?.includes(getPlainProperty(clone.propertyName))) {
                //     clone.isRequired = true;
                // }
            }
            else {
                clone = cloneToolWithSchema(toolFinder.findLayoutToolByUiType(itemUischema.type) ?? unknownTool, this.schema, itemUischema);
            }

            if(clone) {
                clone.edge.setParent(this);
                clone.edge.replaceChilds(clone.initChilds(toolFinder,baseSchemaTool));
                tools.push(clone);
            }
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


