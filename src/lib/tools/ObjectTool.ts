import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/object.component.vue";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/object.form.json";
import jsonFormAsSchemaChild from "./schema/object.asSchemaChild.form.json";
import {rankWith, setSchema} from "@jsonforms/core";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import * as subschemas from "./subschemas";
import {cleanEmptySchema, SchemaTool} from "./SchemaTool";
import * as _ from 'lodash-es';
import {cloneEmptyTool} from "../toolCreation";
import {getPlainProperty, getRequiredFromSchema} from "../normalizer";

export class ObjectTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(1, (uischema, schema, context) => {
        return uischema?.type === 'Control' && schema?.type === 'object'// && undefined !== schema?.properties
    })
    clone = (): ToolInterface => new ObjectTool(this.uischema.type);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type ??= 'object'

        if (undefined === this.schema.properties) {
            this.schema.properties = {}
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        let uidata = {};
        const isUischema = 'uischema' === context?.builder;
        if(isUischema) {
            uidata = {
                ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
                ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
            }
        }

        return {
            propertyName: this.propertyName,
            type: this.schema.type,
            schema: {
                additionalProperties: this.schema?.additionalProperties,
            },
            ...subschemas.prepareOptionDataDefinitions(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            ...uidata,
            _isUischema:isUischema
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);
        this.schema.additionalProperties = cleanEmptySchema(data.schema.additionalProperties);

        const isUischema = 'uischema' === context?.builder;

        if(isUischema) {
            subschemas.setOptionDataRule(this.schema, this.uischema, data);
            subschemas.setOptionDataStyles(this.schema, this.uischema, data);
        }

        subschemas.setOptionDataValidation(this.schema, this.uischema, data);
        subschemas.setOptionDataconditional(this.schema, this.uischema, data);
        subschemas.setOptionDataDefinitions(this.schema, this.uischema, data);
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let setSchema = schema;
        let setUischema = uischema;

        // const parentTool = this.parentTool;
        // if(parentTool instanceof SchemaTool) {
        //     setSchema = jsonFormAsSchemaChild.schema as any;
        //     setUischema = jsonFormAsSchemaChild.uischema;
        // }

        return {
            schema: await resolveSchema(setSchema),
            uischema: await resolveSchema(setUischema),
        } as JsonFormsInterface
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Object',
            icon: 'mdi:code-braces-box',

        }
    }

    generateJsonSchema(): JsonSchema|undefined {
        const properties = {} as Record<string, JsonSchema>;
        const required = [] as Array<string>;

        this.childs.forEach((childTool: ToolInterface) => {
            //probably uischema
            if(_.isEmpty(childTool.schema)) {
                return;
            }

            let childSchema = childTool.generateJsonSchema();
            if(childSchema) {
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
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }


        const createChild = (itemSchema:JsonSchema, uischema:any, propertyName:string) => {

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
        Object.keys(properties).forEach((propertyName:string) => {
            const itemSchema = properties[propertyName];
            const uischema = {type:'Control',scope:'#'} as UISchemaElement;

            createChild(itemSchema, uischema, propertyName);
        });


        /**
         * some if/else/then constructs has partial schemas, create childs based on guessType()
         * for `then:{required:['name']}`
         */
        this.schema?.required?.forEach(propertyName => {
            if(!(propertyName in (this.schema?.properties ?? {}))) {
                const itemSchema = {type:'string'} as JsonSchema;
                const uischema = {type:'Control',scope:'#'} as UISchemaElement;

               // console.log("create required child", {propertyName});

                createChild(itemSchema, uischema, propertyName);
            }
        })

        //:TODO remove
        //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

        return tools;
    }
}

// @ts-ignore
export const objectTool = new ObjectTool();
