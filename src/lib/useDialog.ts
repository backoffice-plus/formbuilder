import {ref, type Ref, shallowRef} from "vue";
import type {Component, VNodeProps} from "@vue/runtime-core";
import {ToolInterface} from "./models";
import {ToolFinder} from "./ToolFinder";
import ConfirmDelete from "@/components/dialog/modals/ConfirmDelete.vue";
import Prompt from "@/components/dialog/modals/Prompt.vue";

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
    close: () => void
}

export type ModalOptions = {
    hideClose?: boolean
    onClose?: (returnValue:any) => void
}

const modals: Ref<RegisteredModal[]> = ref([]);

export const useDialogRegistry = () => {

    const showModal = (component: Component|string, bind: Bind, slots?: RawSlots, options?: ModalOptions): ModalControl => {
        const id = crypto.randomUUID();
        const getDialog = () => document.getElementById(id) as HTMLDialogElement | undefined;

        const modalControl:ModalControl = {
            id,
            getDialog,
            close: () => getDialog()?.close(),
        };
        const registeredModal:RegisteredModal = {
            id,
            component: {is: shallowRef(component), bind: {...bind, dialogId:id}, slots},
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

export const findDialogOpenElements = (): HTMLDialogElement[] => {
    return Array.from(document.querySelectorAll('dialog')).filter(dialog=>dialog.open)
}


export const confirmAndRemoveChild = (parentTool:ToolInterface, toolToDelete:ToolInterface, fb?:any) : Promise<{ removed:{element:ToolInterface,unscope?:boolean} }> => {
    return new Promise((resolve, reject) => {

        const dr = useDialogRegistry();
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

export const showNewPropertyDialogAndGetTool = (toolFinder:ToolFinder|((name:string)=>ToolInterface)) : Promise<ToolInterface[]> => {

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

        const dr = useDialogRegistry()
        dr.showModal(Prompt, {header:"Add new Item", text:"Name of property or coma seperated name list", onSubmit} ,undefined, {onClose});
    });
}
