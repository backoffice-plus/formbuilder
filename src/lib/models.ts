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
import type {ToolInterface} from "./tools";

export const scalarTypes = ['string', 'number', 'integer', 'boolean', 'null'];

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
