import type {JsonSchema} from "@jsonforms/core";
import type {
    Categorization,
    Category,
    ControlElement,
    LabelElement,
    Layout,
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
}

export interface ToolContext {
    fb?: any;
    builder?: string;
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
});


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
