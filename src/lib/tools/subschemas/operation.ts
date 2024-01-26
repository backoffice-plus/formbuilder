import type {Ref} from "vue";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {ToolContext, ToolFinderInterface, ToolInterface} from "@/";
import {cloneToolWithSchema} from "@/lib";

export const prepareOptionData = (context: ToolContext, tool: ToolInterface): Record<string, any> => {
    const baseSchemaTool: Ref<ToolInterface | undefined> = context?.fb?.exposed?.baseSchemaTool;
    const baseUiTool: Ref<ToolInterface | undefined> = context?.fb?.exposed?.baseUiTool;
    const isBaseUiTool = baseUiTool?.value?.uuid === tool.uuid;

    const changeTypeCallback = (value: string) => {
        if (!(isBaseUiTool && baseUiTool)) return;

        const toolFinder:ToolFinderInterface = context?.fb?.exposed?.toolFinder;

        const newTool = toolFinder.findLayoutToolByUiType(value);
        const isTypeChanged = newTool && newTool?.uischema?.type !== baseUiTool.value?.uischema?.type;

        if(!(newTool && isTypeChanged)) return;

        //     /**
        //      * :TODO init old childs to new tool
        //      */
        // const oldElements = tool.generateUiSchema()?.elements;
        // const uischema = { elements: [{"type": "Category","label":"Tab - changed","elements":oldElements,  }] }
        //

         const clone = cloneToolWithSchema(newTool, {});//, uischema);

        // tool.edge.childs.map(child=> {
        //     console.log("oldChild", {child});
        //     child.edge.uiParent = undefined
        // })
        //clone.initChilds(toolFinder, baseSchemaTool.value)

        //
        // const oldChilds = this.edge.childs
        // if ('layoutTool.changeToCategorization' === value) {
        //     baseUiTool.value = cloneToolWithSchema(tabTool, {});//uischema);
        //     //baseUiTool.value?.initChilds(toolFinder);
        //     //oldChilds.forEach(child => baseUiTool.value.edge?.addChild(child));
        //
        //     context?.modalControl?.close()
        // } else {
        //     console.log("Callback LayoutTool unknown Type", {value})
        // }



        baseUiTool.value = clone
        context?.fb?.exposed?.onDropAreaChanged({modal: {element: tool}})
        context?.modalControl?.close()
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
