import type {JsonSchema} from "@jsonforms/core";
import {and, or, isEnumControl, isOneOfControl, isStringControl, rankWith} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";

import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import formInputByType from "../../components/tools/formInputByType.vue";
import {jsonForms as toolOptionsControl} from "../../schema/toolOptionsControl";
import {denormalizeRule} from "../normalizer";
import {updatePropertyNameAndScope} from "../formbuilder";
import {unref} from "vue";


export const selectTool = new Tool('formInputByType', ToolProps.create({
    toolName: 'select',
    jsonForms: {schema: {type: 'string', oneOf: [{const:"a",title:"A"}]}, uischema: {type: 'Control'}}
}), rankWith(2, and(isStringControl, or(isOneOfControl, isEnumControl)))); //TODO: isOneOfEnumControl needed?

selectTool.importer = () => formInputByType;
selectTool.optionJsonforms = toolOptionsControl;

type schemaValidationKey = | 'minimum' | 'maximum' | 'pattern' | 'minLength' | 'maxLength';
type schemaKeyDefault = 'type' | 'format' | 'description' | schemaValidationKey;
type schemaKey = schemaKeyDefault;
const schemaKeys = ['type', 'format', 'description', 'minimum', 'maximum', 'pattern', 'minLength', 'maxLength'] as Array<schemaKey>;
type uiSchemaKey = 'label' | 'i18n' | 'options';
const uiSchemaKeys = ['label', 'i18n', 'options'] as Array<uiSchemaKey>;

selectTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.uischema as ControlElement;

    const data = {} as any;

    data.propertyName = tool.props.propertyName;

    schemaKeys.forEach(key => {
        if (undefined !== schema[key]) data[key] = schema[key]
    });
    uiSchemaKeys.forEach(key => {
        if (undefined !== uischema[key]) data[key] = uischema[key]
    });

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
    /**
     * :TODO better modeling without converting
     */
    //convert enum to object
    // if(options?.rule?.condition?.schema) {
    //     options.rule.condition.schema = JSON.stringify(options.rule.condition.schema);
    // }


    return data;
};

selectTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema|Record<string, any>;
    const uischema = tool.props.jsonForms.uischema as ControlElement;

    updatePropertyNameAndScope(data?.propertyName, tool)


    if(data?.select._type) {
        switch (data?.select._type) {
            case 'enum':
                schema.enum = data.select?.enum ?? [''];
                break;

            case 'oneOf':
                schema.oneOf = data.select?.oneOf ?? [];
                schema.oneOf = schema.oneOf.filter(item => item?.const)

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

