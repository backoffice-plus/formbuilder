import {shallowRef} from "vue";
import type {Ref, Component, VNodeProps} from "vue";
import {ToolInterface} from "./models";
import {ToolFinder} from "./ToolFinder";
import ConfirmDelete from "@/components/dialog/modals/ConfirmDelete.vue";
import Prompt from "@/components/dialog/modals/Prompt.vue";
import ToolOption from "@/components/dialog/modals/ToolOption.vue";

type Bind = VNodeProps | Record<string, unknown>
type RawSlots = {
    [name: string]: unknown;
    $stable?: boolean;
};

export type DynamicComponent = {is:Component|string, bind?:Bind|any, slots?:RawSlots}
export type RegisteredModal = {
    id: string,
    component: DynamicComponent,
    options?: ModalOptions,
    modalControl?: ModalControl,
}

export type ModalControl = {
    id: string,
    getDialog: () => HTMLDialogElement | undefined,
    close: (returnValue?: string) => void
}

export type ModalOptions = {
    hideClose?: boolean
    onClose?: (returnValue:any) => void
}

export const useDialogRegistry = (modals?:Ref<RegisteredModal[]>) => {
    if(!modals) throw "modals argument is empty at useDialogRegistry"

    const showModal = (component: Component|string, bind: Bind, slots?: RawSlots, options?: ModalOptions): ModalControl => {
        const id = crypto.randomUUID();
        const getDialog = () => document.getElementById(id) as HTMLDialogElement | undefined;

        const modalControl:ModalControl = {
            id,
            getDialog,
            close: (returnValue?: string) => getDialog()?.close(returnValue),
        };
        const registeredModal:RegisteredModal = {
            id,
            component: {is: shallowRef(component), bind: {...bind, modalControl}, slots},
            options,
            modalControl,
        };

        modals.value.push(registeredModal)
        return modalControl;
    };

    const removeDialog = (id: string) => {
        modals.value = modals.value.filter(elm => elm.id !== id);
    }

    return {
        modals,
        showModal,
        removeDialog,
    }
}


export const confirmAndRemoveChild = (parentTool:ToolInterface, toolToDelete:ToolInterface, fb:any) : Promise<{ removed:{element:ToolInterface,unscope?:boolean} }> => {

    return new Promise((resolve, reject) => {

        const dr = fb?.exposed?.dialogRegistry
        const {close} = dr.showModal(ConfirmDelete, {
            tool: toolToDelete,
            fb,
            onConfirm() {
                parentTool.edge.removeChild(toolToDelete);

                const isControl = 'Control' === toolToDelete?.uischema?.type;
                if (!isControl) {
                    toolToDelete.edge.findScopedChilds().forEach(child => child.edge.uiParent = undefined);
                }

                resolve({removed: {element: toolToDelete}});

                close?.();
            },
            onUnscope() {
                parentTool.edge.removeChild(toolToDelete);
                resolve({removed: {element: toolToDelete, unscope: true}});

                close?.();
            },
            key: Math.random(),
        })
    });
}

export const showNewPropertyDialogAndGetTool = (toolFinder:ToolFinder|((name:string)=>ToolInterface), fb:any) : Promise<ToolInterface[]> => {

    const isToolFinder = toolFinder instanceof ToolFinder;

    const defaultFindToolCallback = (toolFinder:ToolFinder) => (name:string):ToolInterface => {
        const initSchema = {type:'string'}
        const initUischema = {type: 'Control', scope: '#'}
        return toolFinder.findMatchingToolAndClone({}, initSchema, initUischema, name);
    }

    return new Promise((resolve, reject) => {

        const onSubmit = (input:any) => {
            const names:string[] = input?.split(',').map((item:string) => item.trim()).filter((i:string) => i);

            const tools = names?.map(name => {
                if(isToolFinder) return defaultFindToolCallback(toolFinder as ToolFinder)(name)
                return toolFinder?.(name)
            }).filter(i=>i);

            resolve(tools ?? []);
        }

        const onClose = (input:any) => {
            if(!input) {
                return reject("aborted");
            }
        }

        const dr = fb?.exposed?.dialogRegistry
        dr.showModal(Prompt, {header:"Add new Item", text:"Name of property or coma seperated name list", onSubmit} ,undefined, {onClose});
    });
}

export const showToolOptions = (tool:ToolInterface, fb:any) => {
    const {close} = fb?.exposed?.dialogRegistry?.showModal(ToolOption, {
        tool:tool,
        onSubmit: () => {
            close?.()
            fb?.exposed?.onDropAreaChanged({modal: {element: tool}})
        }
    })
}
