import type {JsonSchema} from "@jsonforms/core";
import type {
    Categorization,
    Category,
    ControlElement, Internationalizable, Labelable, LabelDescription,
    LabelElement,
    Layout, Scoped,
    UISchemaElement,
} from "@jsonforms/core/src/models/uischema";
import type {PropType} from "vue";
import type {RankedTester} from "@jsonforms/core/src/testers/testers";

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

    childs: ToolInterface[]
    parentTool: ToolInterface|undefined

    generateJsonSchema: () => JsonSchema|undefined
}

export interface ToolContext {
    fb?: any;
    builder?: string;
    schemaOnly?: boolean;
    schemaReadOnly?: string;
    rootSchema?: JsonSchema,
    baseSchemaTool?: ToolInterface,
}

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
    tools: [],
    schemaTool: String,
    schemaToolProps: Object,
});
export interface formbuilderPropsI {
    schema: JsonSchema,
    jsonForms: any,
    jsonFormsRenderers: [],
    schemaOnly: boolean,
    schemaReadOnly: boolean,
    tools: [],
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
