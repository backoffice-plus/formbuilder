import type {JsonSchema} from "@jsonforms/core";
import type {
    LabelElement,
    ControlElement,
    Categorization,
    Category,
    UISchemaElement,
} from "@jsonforms/core/src/models/uischema";

export type JsonFormsSchema = JsonSchema;
// @ts-ignore
export interface JsonFormsUISchema extends UISchemaElement, LabelElement, ControlElement, Category, Categorization {
    type:string
}

export class Tool {
    componentName: string;
    uuid: string;
    props: ToolProps;
    tester: undefined|any = undefined;

    constructor(componentName: string, props: ToolProps, tester:undefined|any = undefined) {
        this.componentName = componentName;
        this.props = props;
        this.tester = tester;

        //this.uuid = crypto.randomUUID();
        this.uuid = String(Date.now().toString(32)+Math.random().toString(16)).replace(/\./g, '');
    }

    clone(schema:JsonFormsSchema|undefined = undefined, uischema:JsonFormsUISchema|undefined = undefined): Tool {

        const props = this.props.clone();
        let jsonForms = this.props.jsonForms;
        if(schema && uischema) {
            props.jsonForms = new JsonForms(schema, uischema)
        }
        else {
            props.jsonForms = jsonForms.clone();
        }



        return new Tool(
            this.componentName,
            props,
            this.tester,
            // new ToolProps(
            //     this.props.inputType,
            //     this.props.toolType,
            //     jsonForms,
            //     this.props.propertyName,
            // )
        );
    }
}


export class ToolProps {
    constructor(
        public readonly toolType: string,
        private _jsonForms: JsonForms|any = new JsonForms(),
        public propertyName: string|undefined = undefined,
        public toolName: string|undefined = undefined,
        public schemaReadOnly: boolean = false,
    ) {
        if(!(this._jsonForms instanceof JsonForms)) {
            this._jsonForms = new JsonForms(
                this._jsonForms?.schema ?? {},
                this._jsonForms?.uischema ?? {},
            )
        }
    }


    get jsonForms() : JsonForms {
        return this._jsonForms as JsonForms;
    }
    set jsonForms(jsonForms:JsonForms) {
        this._jsonForms = jsonForms;
    }

    static create(props:any) : ToolProps {
        return new ToolProps(
            props?.toolType,
            props?.jsonForms,
            props?.propertyName,
            props?.toolName,
            props?.schemaReadOnly,
        )
    }

    clone() : ToolProps {
        return new ToolProps(
            this.toolType,
            this.jsonForms.clone(),
            this.propertyName,
            this.toolName,
            this.schemaReadOnly,
        )
    }
}


export class JsonForms {
    constructor(
        public schema: JsonFormsSchema = {} as JsonFormsSchema,
        public uischema: JsonFormsUISchema = {} as JsonFormsUISchema,
    )
    {
    }

    update(data:Record<string, any>) {
        Object.keys(data).forEach(key => {
            if(updatableSchemaKeys.includes(key)) {
                //@ts-ignore
                this.schema[key] = data[key];
            }
            if(updatableUischemaKeys.includes(key)) {
                //@ts-ignore
                this.uischema[key] = data[key];
            }
        });

        if(undefined !== data.rule) {
            if(undefined !== data.rule.condition) {
                this.uischema.rule = data.rule;
            }
        }

        //:TODO fix required
        // //just a workaround to "send" required info from this tool to root schema
        // if(undefined !== data?.required) {
        //     this.schema.required = [data?.required ? "true" : "false"];
        // }
    }

    clone() : JsonForms {
        return new JsonForms(
            {...this.schema},
            {...this.uischema},
        )
    }
}


export const updatableSchemaKeys = ['type', 'format', 'enum', 'oneOf', 'description', 'minimum','maximum', 'pattern', 'minLength', 'maxLength'];
// export interface JsonFormsSchema {
//     type: string;
//     properties?: Record<string, JsonFormsSchema>;
//     description?: string;
//     format?: string;
//     minimum?: number;
//     maximum?: number;
//     default?: number;
//     minLength?: number;
//     maxLength?: number;
//     enum?: [string];
//     oneOf?: [any];
//     required?: Array<string>;
//     customType: string;
// }

export const updatableUischemaKeys = ['label', 'i18n', 'options', 'text'];
// export interface JsonFormsUISchema {
//     type: string;
//     elements: Array<JsonFormsUISchema>;
//     scope?: string;
//     text?: string;
//     i18n?: string;
//     label?: string;
//     suggestion?: string;
//     options?: Record<string, any>;
//     rule?: JsonFormsRule;
// }

// export interface JsonFormsRule {
//     effect: string;
//     condition: JsonFormsRuleCondition;
// }
// export interface JsonFormsRuleCondition {
//     scope: string;
//     schema: Record<string, any>; //const: true|"Value",
// }
