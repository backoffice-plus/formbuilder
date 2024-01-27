import type {
    Categorization,
    Category,
    ControlElement,
    LabelElement,
    Layout,
    UISchemaElement,
    RankedTester,
    JsonSchema,
} from "@jsonforms/core";
import type {PropType} from "vue";
import type {ToolEdge} from "./ToolEdge";
import {ModalControl} from "@/lib/useDialog";
import type {JsonSchema7} from "@jsonforms/core/src/models/jsonSchema7";

export const scalarTypes = ['string', 'number', 'integer', 'boolean', 'null'];


export interface ToolInterface {
    uuid: string;

    propertyName: string;
    isRequired: boolean;

    schema: JsonSchema;
    uischema: JsonFormsUISchema|boolean|any;
    tester: RankedTester | undefined,
    importer: () => any,
    optionDataPrepare: (context: ToolContext) => Record<string, any>;
    optionDataUpdate: (context: ToolContext, data: Record<string, any>) => void;
    optionJsonforms: (context: ToolContext) => Promise<JsonFormsInterface | undefined>;

    /** :TODO add cloneWithSchema(schema,uischema) **/
    clone: () => ToolInterface;
    toolbarOptions: () => Record<string, any>;

    edge: ToolEdge;
    /** @deprecated use edge.childs  **/
    childs: ToolInterface[]

    generateJsonSchema: () => JsonSchema|undefined
    generateUiSchema: () => JsonFormsUISchema|undefined
    initChilds: (toolFinder:ToolFinderInterface, baseSchemaTool?:ToolInterface|undefined) => ToolInterface[]
}

export interface JsonSchemaDraft07 extends JsonSchema7 {
    //@see https://json-schema.org/understanding-json-schema/reference/non_json_data#contentmediatype
    contentMediaType?:string
    //@see https://json-schema.org/understanding-json-schema/reference/non_json_data#contentencoding
    contentEncoding?:string
}

export interface ToolContext {
    fb?: any;
    builder?: string;
    schemaOnly?: boolean;
    schemaReadOnly?: boolean;
    rootSchema?: JsonSchema,
    baseSchemaTool?: ToolInterface,
    modalControl?: ModalControl,

    /** @deprecated - Is this needed anywhere?? */
    parentMethod?:string,
}
export interface ToolFinderInterface {
    //:TODO add all methods from ToolFinder
    findLayoutToolByUiType(uiType: string): ToolInterface | undefined
    findMatchingToolAndClone(schema: JsonSchema, itemSchema: JsonSchema, itemUischema: any, propertyName?:string, fromTools?:ToolInterface[]): ToolInterface
    findMatchingTool(schema: JsonSchema, itemSchema: JsonSchema, itemUischema: any, fromTools?:ToolInterface[]): ToolInterface
    findLayoutToolByUiType(uiType: string): ToolInterface | undefined

    getTypedTools(): TypedTools
    guessType(schema: JsonSchema): string|undefined
}

export type TypedTools = {
    control: ToolInterface[],
    layout: ToolInterface[],
};

// @ts-ignore
export interface JsonFormsUISchema extends UISchemaElement, LabelElement, ControlElement, Category, Categorization {
    type: string
}

//export type JsonFormsUISchema = UISchemaElement | LabelElement | ControlElement | Category| Categorization;


//root JsonForms
export interface JsonFormsInterface {
    schema: JsonSchema;
    uischema: Layout;
}

export const toolComponentProps = () => ({

    tool: {
        required: true as true,
        type: Object as PropType<ToolInterface>
    },

    isToolbar: {
        required: false as false,
        type: Boolean,
        default: false as false,
    },

    isRoot: {
        required: false as false,
        type: Boolean,
        default: false as false,
    },

    //from arrayTool
    isInlineType: {
        required: false as false,
        type: Boolean,
        default: false as false,
    },

    //from FormbuilderRenderer
    hideActionbar: {
        required: false as false,
        type: Boolean,
        default: false as false,
    },
    prefixLabel: {
        required: false as false,
        type: String,
        default: '' as String,
    },
    propertyName: {
        required: false as false,
        type: String,
        default: '' as String,
    },

});


export const formbuilderProps = () => ({
    schema:Object,
    jsonForms: Object,
    jsonFormsRenderers: Array,
    schemaOnly: Boolean,
    schemaReadOnly: Boolean,
    tools: Array,
    schemaTool: String,
    schemaToolProps: Object,
});
export interface formbuilderPropsI {
    schema: JsonSchema,
    uischema: Layout,
    jsonForms: any,
    jsonFormsRenderers: [],
    schemaOnly: boolean,
    schemaReadOnly: boolean,
    tools: ToolInterface[],
    schemaTool: string,
    schemaToolProps: any,
}

/**
 *
 * @see http://sortablejs.github.io/Sortable/#thresholds
 *
 */
export const vuedraggableOptions = {

    'item-key': "uuid",

    swapThreshold:0.7,
    invertSwap: true,
    fallbackOnBody: true,
    animation: 150,
}
