import type {Ref} from "vue";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {ToolContext, ToolFinderInterface, ToolInterface} from "@/";
import {cloneToolWithSchema} from "@/lib";

export const prepareOptionData = (context: ToolContext, tool: ToolInterface): Record<string, any> => {
    const baseUiTool: Ref<ToolInterface | undefined> = context?.fb?.exposed?.baseUiTool;
    const isBaseUiTool = baseUiTool?.value?.uuid === tool.uuid;

    const changeTypeCallback = (value: string) => {
        if (!(isBaseUiTool && baseUiTool)) return;

        const toolFinder:ToolFinderInterface = context?.fb?.exposed?.toolFinder;

        const newTool = toolFinder.findLayoutToolByUiType(value);
        const isTypeChanged = newTool && newTool?.uischema?.type !== baseUiTool.value?.uischema?.type;

        if(newTool && isTypeChanged) {
            const clone = cloneToolWithSchema(newTool, {});//uischema);

            //
            //     /**
            //      * :TODO init old elements/childs to first tab (currently control elements are not initialized)
            //      */

            baseUiTool.value = clone
            context?.modalControl?.close()
            context?.fb?.exposed?.onDropAreaChanged({modal: {element: tool}})
        }


        // const oldChilds = this.edge.childs
        // const oldElements = this.generateUiSchema()?.elements;
        // if ('layoutTool.changeToCategorization' === value) {
        //     // const uischema = { elements: [{"type": "Category","elements": oldElements ?? [],  }] }

        //     baseUiTool.value = cloneToolWithSchema(tabTool, {});//uischema);
        //     //baseUiTool.value?.initChilds(toolFinder);
        //     //oldChilds.forEach(child => baseUiTool.value.edge?.addChild(child));
        //
        //     context?.modalControl?.close()
        // } else {
        //     console.log("Callback LayoutTool unknown Type", {value})
        // }

    };

    return {
        operation: {
            changeToType: undefined,//'Categorization',
            _isBaseUiTool: isBaseUiTool,
            _changeTypeCallback: changeTypeCallback,
        }
    };
}
export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

}
