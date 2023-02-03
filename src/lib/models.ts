import type {JsonSchema, Tester} from "@jsonforms/core";
import type {
    Layout,
    LabelElement,
    ControlElement,
    Categorization,
    Category,
    UISchemaElement,
} from "@jsonforms/core/src/models/uischema";
import type {RankedTester} from "@jsonforms/core/src/testers/testers";


// @ts-ignore
export interface JsonFormsUISchema extends UISchemaElement, LabelElement, ControlElement, Category, Categorization {
    type:string
}
//root JsonForms
export interface JsonFormsInterface {
    schema: JsonSchema;
    uischema: Layout;
}

export interface ToolInterface {
    uuid: string;
    toolType: string;

    propertyName: string;
    isRequired:boolean;

    schema: JsonSchema;
    uischema: JsonFormsUISchema;
    schemaReadOnly: boolean;

    tester:RankedTester|undefined,
    importer:() => any,
    optionDataPrepare: (tool:ToolInterface) => Record<string, any>;
    optionDataUpdate: (tool:ToolInterface, data:Record<string, any>) => void;
    optionJsonforms: (tool:ToolInterface) => Promise<JsonFormsInterface|undefined>;

    clone: () => ToolInterface;
}

/** @deprecated create own tool classes with ToolInterface **/
export class Tool implements ToolInterface{
    tester: RankedTester|undefined = undefined;

    //constructor
    uuid: string;
    toolType: string; //to distinguish between difference Control types

    propertyName: string = 'Unknown';
    isRequired:boolean = false;//neccesary because required is stored in parentNode
    schemaReadOnly: boolean = false; //only neccesary to show at toolbar :TODO: remove it and find other solution

    //from props
    schema: JsonSchema = {};
    uischema: JsonFormsUISchema;

    /** @deprecated */
    get toolName() {
        return this.uischema.type;
    }
    get uischemyType() {
        return this.uischema.type;
    }

    importer: () => any = ()=>undefined;
    optionJsonforms: (tool:ToolInterface) => Promise<JsonFormsInterface|undefined> = () => new Promise(()=>undefined);
    optionJsonformsRenderer: () => any = ()=>undefined;
    optionDataPrepare: (tool:ToolInterface) => Record<string, any> = () => {return{}};
    optionDataUpdate: (tool:ToolInterface, data:any) => void = ()=> {};

    constructor(uischemaType:string='Unknown', toolType:string|undefined = undefined) {
        this.uischema = {
            type: uischemaType
        } as JsonFormsUISchema;

        this.toolType = toolType ?? uischemaType.toLowerCase();

        //this.uuid = crypto.randomUUID();
        this.uuid = String(Date.now().toString(32)+Math.random().toString(16)).replace(/\./g, '');
    }

    clone() : ToolInterface {
        const clone = new Tool(this.uischema.type);

        clone.propertyName = this.propertyName;
        clone.isRequired = this.isRequired;

        clone.schema= {...this.schema};
        clone.uischema= {...this.uischema};

        clone.schemaReadOnly= this.schemaReadOnly;

        clone.importer = this.importer;
        clone.tester = this.tester;
        clone.optionJsonforms = this.optionJsonforms;
        clone.optionJsonformsRenderer = this.optionJsonformsRenderer;
        clone.optionDataPrepare = this.optionDataPrepare;
        clone.optionDataUpdate = this.optionDataUpdate;

        return clone;
    }
}


/** @deprecated */
export const updatableSchemaKeys = ['type', 'format', 'enum', 'oneOf', 'description', 'minimum','maximum', 'pattern', 'minLength', 'maxLength' , '$ref'];
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

/** @deprecated */
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
