import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/object.component.vue";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/object.form.json";
import jsonFormAsSchemaChild from "./schema/object.asSchemaChild.form.json";
import {rankWith, setSchema} from "@jsonforms/core";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";
import _ from "lodash";
import {cloneToolWithSchema} from "../toolCreation";
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
        this.schema.additionalProperties = data.schema.additionalProperties;

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


    initChilds(toolFinder: ToolFinderInterface): ToolInterface[] {
        const tools = [] as Array<ToolInterface>;

        //for moving existing tools to another list
        if(this.childs?.length) {
            return this.childs;
        }


        const properties = this.schema?.properties ?? {};
        !_.isEmpty(properties) && Object.keys(properties).forEach((propertyName:string) => {
            const itemSchema = properties[propertyName];
            const uischema = {type:'Control',scope:'#'} as UISchemaElement;
            //const clone = cloneToolWithSchema(schemaTool, itemSchema, {});
            const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
            clone.propertyName = propertyName;

            //required
            const required = getRequiredFromSchema(clone.propertyName, this.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }

            tools.push(clone);
        });

        //:TODO remove
        //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

        return tools;
    }
}

// @ts-ignore
export const objectTool = new ObjectTool();
