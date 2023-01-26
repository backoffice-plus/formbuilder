import type {JsonSchema} from "@jsonforms/core";
import {and, or, isEnumControl, isOneOfControl, isStringControl, rankWith} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";

import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import formInputByType from "../../components/tools/formInputByType.vue";
import {jsonForms as toolOptionsControl} from "../../schema/toolOptionsControl";
import {denormalizeRule} from "../normalizer";


export const selectTool = new Tool('formInputByType', ToolProps.create({
    toolName: 'select',
    jsonForms: {schema: {type: 'string', oneOf: [{const:"a",title:"A"}]}, uischema: {type: 'Control'}}
}), rankWith(2, and(isStringControl, or(isOneOfControl, isEnumControl)))); //TODO: isOneOfEnumControl needed?

selectTool.importer = () => formInputByType;
selectTool.optionJsonforms = toolOptionsControl;

type schemaValidationKey = | 'minimum' | 'maximum' | 'pattern' | 'minLength' | 'maxLength';
type schemaKeyDefault = 'type' | 'format' | 'description' | schemaValidationKey;
type schemaKey = 'oneOf' | 'enum' | schemaKeyDefault;
const schemaKeys = ['type', 'format', 'enum', 'oneOf', 'description', 'minimum', 'maximum', 'pattern', 'minLength', 'maxLength'] as Array<schemaKey>;
type uiSchemaKey = 'label' | 'i18n' | 'options';
const uiSchemaKeys = ['label', 'i18n', 'options'] as Array<uiSchemaKey>;

selectTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.schema as ControlElement;

    const data = {} as any;

    data.propertyName = tool.props.propertyName;

    schemaKeys.forEach(key => {
        if (undefined !== schema[key]) data[key] = schema[key]
    });
    uiSchemaKeys.forEach(key => {
        if (undefined !== uischema[key]) data[key] = uischema[key]
    });

    data._combinator = 'oneOf'
    if(data.enum) {
        data._combinator = 'enum'
    }

    //fix empty elements
    // if (undefined !== data.oneOf && !data.oneOf.length) {
    //     data.oneOf = [{}]
    // }
    // if (undefined !== data.enum && !data.enum.length) {
    //     data.enum = ['']
    // }

    /**
     * :TODO better modeling without converting
     */
    //convert enum to object
    if(data?.enum) {
        data.enum = data.enum.map((name: any) => {return {name: String(name)} });
    }
    // if(options?.rule?.condition?.schema) {
    //     options.rule.condition.schema = JSON.stringify(options.rule.condition.schema);
    // }

    return data;
};

selectTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema|Record<string, any>;
    const uischema = tool.props.jsonForms.schema as ControlElement;

    if (!data.propertyName) {
        throw "invalid propertyName";
    }
    tool.props.propertyName = data.propertyName;

    //convert enum to map
    if (data?.enum) {
        data.enum = data.enum?.map((item: any) => String(item?.name ?? '')) ?? [''];
        data.enum = [...new Set(data.enum)];
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

