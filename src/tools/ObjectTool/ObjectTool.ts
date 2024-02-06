import {rankWith} from "@jsonforms/core";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import * as _ from 'lodash-es';
import {BuilderMode, cloneEmptyTool, createResolvedJsonForms, getPlainProperty, getRequiredFromSchema, resolveSchema, UiOptions} from "@/lib";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface, BuilderModeType} from "@/lib";
import * as subschemas from "@/lib/tools/subschemas";
import {ControlTool} from "@/lib/tools/controlTool";
import {cleanEmptySchema} from "@/lib/tools/SchemaTool";
import {schema, uischemaModeBoth, uischemaModeSchema, uischemaModeUi, toolComponent} from "./";

export class ObjectTool extends ControlTool {

    importer = () => toolComponent;
    tester = rankWith(1, (uischema, schema, context) => {
        return uischema?.type === 'Control' && schema?.type === 'object'// && undefined !== schema?.properties
    })
    clone = (): ToolInterface => new ObjectTool(this.uischema.type);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type = 'object'

        if (undefined === this.schema.properties) {
            this.schema.properties = {}
        }
    }

    availableUiOptions(): UiOptions | undefined {
        return {}
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data: any = super.optionDataPrepare(context);

        if (context.isBuilderMode?.schema) {
            data.schema.additionalProperties = this.schema?.additionalProperties
        }

        return {
            ...data,
            ...subschemas.prepareOptionDataDefinitions(context, this.schema, this.uischema),
        };
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        if (context.isBuilderMode?.schema) {
            subschemas.setOptionDataDefinitions(this.schema, this.uischema, data);
        }
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let uischemas: Record<BuilderModeType, any> = {
            [BuilderMode.BOTH]: uischemaModeBoth,
            [BuilderMode.SCHEMA]: uischemaModeSchema,
            [BuilderMode.UI]: uischemaModeUi,
        };

        return createResolvedJsonForms([
            resolveSchema(schema, undefined, this, context),
            resolveSchema(uischemas[context.builderMode ?? BuilderMode.BOTH])
        ]);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Object',
            icon: 'mdi:code-braces-box',

        }
    }

    generateJsonSchema(): JsonSchema | undefined {
        const properties = {} as Record<string, JsonSchema>;
        const required = [] as Array<string>;

        this.childs.forEach((childTool: ToolInterface) => {
            //probably uischema
            if (_.isEmpty(childTool.schema)) {
                return;
            }

            let childSchema = childTool.generateJsonSchema();
            if (childSchema) {
                properties[childTool.propertyName] = childSchema;

                if (childTool.isRequired) {
                    required.push(childTool.propertyName);
                }
            }
        });

        return {
            ...this.schema,
            type: 'object',
            properties: properties,
            required: required.length ? required : undefined,
            //...conditionalSchemas
        } as JsonSchema;
    }


    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const tools = [] as Array<ToolInterface>;

        //for moving existing tools to another list
        if (this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }


        const createChild = (itemSchema: JsonSchema, uischema: any, propertyName: string) => {

            const schemaTools = toolFinder.getTypedTools().control;
            const matchingTool = toolFinder.findMatchingTool({}, itemSchema, uischema, schemaTools);
            const clone = cloneEmptyTool(matchingTool, itemSchema, propertyName)

            //required
            const required = getRequiredFromSchema(clone.propertyName, this.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }

            clone.edge.setParent(this);
            clone.edge.replaceChilds(clone.initChilds(toolFinder));

            tools.push(clone);
        }


        const properties = this.schema?.properties ?? {};
        Object.keys(properties).forEach((propertyName: string) => {
            const itemSchema = properties[propertyName];
            const uischema = {type: 'Control', scope: '#'} as UISchemaElement;

            createChild(itemSchema, uischema, propertyName);
        });


        /**
         * some if/else/then constructs has partial schemas, create childs based on guessType()
         * for `then:{required:['name']}`
         */
        const required = this.schema?.required
        required?.length && required.forEach(propertyName => {
            if (!(propertyName in (this.schema?.properties ?? {}))) {
                const itemSchema = {type: 'string'} as JsonSchema;
                const uischema = {type: 'Control', scope: '#'} as UISchemaElement;

                // console.log("create required child", {propertyName});

                createChild(itemSchema, uischema, propertyName);
            }
        })

        //:TODO remove
        //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

        return tools;
    }

    static create() {
        return new ObjectTool();
    }
}
