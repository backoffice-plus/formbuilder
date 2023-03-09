import type {JsonSchema} from "@jsonforms/core";
import {and, isEnumControl, isOneOfControl, isStringControl, or, rankWith} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface, ToolInterface} from "./index";

import {AbstractTool} from "./AbstractTool";
import formInputByType from "../../components/tools/formInputByType.vue";
import {
    prepareOptionDataLabel, prepareOptionDataRule, prepareOptionDataValidation,
    setOptionDataLabel, setOptionDataRule, setOptionDataValidation,
    schema, uischema
} from "./schema/select.schema";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";


export class SelectTool extends AbstractTool implements ToolInterface {

    // constructor(uischemaType: string = 'Control', toolType: string | undefined = 'select') {
    //     super(uischemaType, toolType);
    //
    //     this.schema = {
    //         type: 'string',
    //         //oneOf: [{const:"a",title:"A"}],
    //        // enum: [''],
    //     }
    // }

    importer = () => formInputByType;
    tester = rankWith(2, and(isStringControl, or(isOneOfControl, isEnumControl))); //TODO: isOneOfEnumControl needed?

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        // if(!this.schema.enum && !this.schema.oneOf) {
        //     this.schema.enum = [''];
        // }
    }

    optionDataPrepare(): Record<string, any> {
        const schema = this.schema as JsonSchema;
        const uischema = this.uischema as ControlElement;

        const data = {
            propertyName: this.propertyName,
            type: schema.type,
            format: schema.format,
            options: uischema.options,

            required: this.isRequired,
        } as any;

        _.merge(
            data,
            prepareOptionDataValidation(schema, uischema),
            prepareOptionDataLabel(schema, uischema),
            prepareOptionDataRule(schema, uischema),
        )

        if (schema.enum) {
            data.enumOrOneOf = {enum: schema.enum};
        } else if (schema.oneOf) {
            data.enumOrOneOf = {oneOf: schema.oneOf};
        }


        return data;
    }


    optionDataUpdate(data: Record<string, any>): void {
        const schema = this.schema as JsonSchema | Record<string, any>;
        const uischema = this.uischema as ControlElement;

        updatePropertyNameAndScope(data?.propertyName, this)

        schema.type = data.type;
        schema.format = data.format;
        uischema.options = data.options ?? {};

        setOptionDataValidation(schema, uischema, data);
        setOptionDataLabel(schema, uischema, data);
        setOptionDataRule(schema, uischema, data);

        this.isRequired = data.required;

        if (data?.enumOrOneOf) {
            if (data?.enumOrOneOf?.enum) {
                schema.enum = data?.enumOrOneOf?.enum ?? [''];
                schema.oneOf && delete schema.oneOf;
            } else if (data?.enumOrOneOf?.oneOf) {
                schema.oneOf = data.enumOrOneOf?.oneOf ?? [];
                schema.oneOf = schema.oneOf.filter((item: any) => item?.const)

                if (!schema.oneOf.length) {
                    schema.oneOf = [{const: ''}];
                }
                schema.enum && delete schema.enum;
            }
        }

        if(!this.schema.enum && !this.schema.oneOf) {
            this.schema.enum = [''];
        }
    }


    async optionJsonforms(): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new SelectTool(this.uischema.type);
    }

    toolbarOptions():Record<string, any> {
        return {
            title:'Control',
            icon:'mdi:form-select',
            hideIconAtDropArea:true,
            labelAtDropArea:'Control'

        }
    }
}


export const selectTool = new SelectTool()
