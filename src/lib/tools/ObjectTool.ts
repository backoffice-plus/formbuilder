import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/object.component.vue";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {schema, uischema} from "./schema/object.form.json";
import jsonFormAsSchemaChild from "./schema/object.asSchemaChild.form.json";
import {rankWith, setSchema} from "@jsonforms/core";
import type {JsonSchema} from "@jsonforms/core";
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";
import _ from "lodash";

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

        const schema = {
            additionalProperties: this.schema?.additionalProperties,
        }

        return {
            propertyName: this.propertyName,
            type: this.schema.type,
            schema: schema,
            ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            ...subschemas.prepareOptionDataDefinitions(context, this.schema, this.uischema),
            _isUischema:'uischema' === context?.builder
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)

        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataStyles(this.schema, this.uischema, data);
        subschemas.setOptionDataValidation(this.schema, this.uischema, data);
        subschemas.setOptionDataconditional(this.schema, this.uischema, data);
        subschemas.setOptionDataDefinitions(this.schema, this.uischema, data);

        this.schema = {
            ...this.schema,
            ...data.schema
        };
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let setSchema = schema;
        let setUischema = uischema;

        const parentTool = this.parentTool;
        if(parentTool instanceof SchemaTool) {
            setSchema = jsonFormAsSchemaChild.schema as any;
            setUischema = jsonFormAsSchemaChild.uischema;
        }

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

    generateJsonSchema(): JsonSchema {
        const properties = {} as Record<string, JsonSchema>;
        const required = [] as Array<string>;

        this.childs.forEach((childTool: ToolInterface) => {
            //probably uischema
            if(_.isEmpty(childTool.schema)) {
                return;
            }

            properties[childTool.propertyName] = childTool.generateJsonSchema();

            if (childTool.isRequired) {
                required.push(childTool.propertyName);
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
}

// @ts-ignore
export const objectTool = new ObjectTool();
