import {inject, provide} from 'vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla/src/util/composition";
import merge from "lodash/merge";

export const defaultStyles: BopStyles = {
    oneOf: {
        root: 'oneof',
        select: 'oneof-select',
    },
};

export interface BopStyles {
    oneOf: {
        root?: string;
        select?: string;
    };
}

export interface NestedInfo {
    level: number;
    parentElement?: 'array' | 'object';
}

export const useNested = (element: false | 'array' | 'object'): NestedInfo => {
    const nestedInfo = inject<NestedInfo>('jsonforms.nestedInfo', {level: 0});
    if (element) {
        provide('jsonforms.nestedInfo', {
            level: nestedInfo.level + 1,
            parentElement: element,
        });
    }
    return nestedInfo;
};

export const useBoPlusVanillaControl  = <I extends { control: any; handleChange: any}>(
    input: I,
    adaptTarget: (target: any) => any = v => v.value
) => {
    const control = useVanillaControl(input, adaptTarget);

    return {
        ...control,
        styles: merge(control.styles, defaultStyles),
    }
}
