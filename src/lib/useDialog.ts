import {ref, type Ref, shallowRef} from "vue";
import type {Component, VNodeProps} from "@vue/runtime-core";

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

