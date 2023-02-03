import type {JsonSchema} from "@jsonforms/core";
import {and, or, isEnumControl, isOneOfControl, isStringControl, rankWith} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";

import type {JsonFormsInterface, ToolInterface} from "../models";
import {Tool} from "../models";
import formInputByType from "../../components/tools/formInputByType.vue";
import {schema, uischema} from "./schema/toolControl";
import {denormalizeRule} from "../normalizer";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import {controlTool} from "./controlTool";
import {reject} from "lodash";


export const selectTool = new Tool('Control', 'select');

selectTool.schema={type: 'string', oneOf: [{const:"a",title:"A"}]};
selectTool.tester = rankWith(2, and(isStringControl, or(isOneOfControl, isEnumControl))); //TODO: isOneOfEnumControl needed?
selectTool.importer = () => formInputByType;
selectTool.optionJsonforms = async (tool) : Promise<JsonFormsInterface> => {
    return {
        schema:await resolveSchema(schema),
        uischema:await resolveSchema(uischema),
    }
};

type schemaValidationKey = | 'minimum' | 'maximum' | 'pattern' | 'minLength' | 'maxLength';
type schemaKeyDefault = 'type' | 'format' | 'description' | schemaValidationKey;
type schemaKey = schemaKeyDefault;
const schemaKeys = ['type', 'format', 'description', 'minimum', 'maximum', 'pattern', 'minLength', 'maxLength'] as Array<schemaKey>;
type uiSchemaKey = 'label' | 'i18n' | 'options';
const uiSchemaKeys = ['label', 'i18n', 'options'] as Array<uiSchemaKey>;

selectTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.schema as JsonSchema;
    const uischema = tool.uischema as ControlElement;

    const data = {} as any;

    data.propertyName = tool.propertyName;

    schemaKeys.forEach(key => {
        if (undefined !== schema[key]) data[key] = schema[key]
    });
    uiSchemaKeys.forEach(key => {
        if (undefined !== uischema[key]) data[key] = uischema[key]
    });

    if(uischema.rule) {
        data.rule = uischema.rule;
    }

    /**
     * :TODO right now its not possible to change from oneOf to enum
     * - the jsonforms renderer throws error at isOneOfEnumControl
     */
    if(schema.enum) {
        data.select = {
            enum: schema.enum,
            _type: 'enum'
        }
    }
    else if(schema.oneOf) {
        data.select = {
            oneOf: schema.oneOf,
            _type: 'oneOf'
        }
    }


    return data;
};

selectTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.schema as JsonSchema|Record<string, any>;
    const uischema = tool.uischema as ControlElement;

    updatePropertyNameAndScope(data?.propertyName, tool)


    if(data?.select._type) {
        switch (data?.select._type) {
            case 'enum':
                schema.enum = data.select?.enum ?? [''];
                break;

            case 'oneOf':
                schema.oneOf = data.select?.oneOf ?? [];
                schema.oneOf = schema.oneOf.filter((item:any) => item?.const)

                if(!schema.oneOf.length) {
                    schema.oneOf = [{const:''}];
                }
                break;
        }
    }

    schemaKeys.forEach(key => schema[key] = data[key]);
    uiSchemaKeys.forEach(key => uischema[key] = data[key]);

    //:TODO better rule schema without denormalization
    if (undefined !== data.rule) {
        const rule = denormalizeRule(data.rule);
        if (undefined !== rule.condition) {
            uischema.rule = rule;
        }
    }
};

