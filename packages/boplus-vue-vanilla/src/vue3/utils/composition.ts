import {computed, inject, provide} from 'vue';
import type {ComputedRef} from 'vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla/src/util/composition";
import {composePaths, computeLabel, getFirstPrimitiveProp, Resolve} from "@jsonforms/core";
import _ from "lodash";
import {useStyles} from "@jsonforms/vue-vanilla";

export const defaultStyles: BopStyles = {
    oneOf: {
        root: 'oneof',
        select: 'oneof-select',
    },
    objectAddProps: {
        root: 'object-addprops-root',
        toolbar: 'object-addprops-toolbar',
        items: 'object-addprops-items',
    },
};

export interface BopStyles {
    oneOf: {
        root?: string;
        select?: string;
    }
    objectAddProps: {
        root?: string;
        toolbar?: string;
        items?: string;
    }
}

export interface NestedInfo {
    level: number;
    parentElement?: 'array' | 'object';
}

export const useControlAppliedOptions = <I extends { control: any }>(
    input: I
) => {
    return computed(() =>
        _.merge(
            {},
            JSON.parse(JSON.stringify(input.control.value.config)), //deepmerge
            JSON.parse(JSON.stringify(input.control.value.uischema?.options ?? [])), //deepmerge
        )
    )
};

export const useComputedLabel = <I extends { control: any }>(
    input: I,
    appliedOptions: ComputedRef<any>
) => {
    return computed((): string => {
        return computeLabel(
            input.control.value.label,
            input.control.value.required,
            !!appliedOptions.value?.hideRequiredAsterisk
        );
    });
};

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
        styles: _.merge(control.styles, defaultStyles),
    }
}

/**
 * Adds styles, appliedOptions and childUiSchema
 */
export const useBoPlusArrayControl = <I extends { control: any }>(
    input: I
) => {
    const appliedOptions = useControlAppliedOptions(input);

    const computedLabel = useComputedLabel(input, appliedOptions);

    const childLabelForIndex = (index: number | null) => {
        if (index === null) {
            return '';
        }
        const childLabelProp =
            input.control.value.uischema.options?.childLabelProp ??
            input.control.value.uischema.options?.elementLabelProp ??
            getFirstPrimitiveProp(input.control.value.schema);
        if (!childLabelProp) {
            return `${index}`;
        }
        const labelValue = Resolve.data(
            input.control.value.data,
            composePaths(`${index}`, childLabelProp)
        );
        if (
            labelValue === undefined ||
            labelValue === null ||
            Number.isNaN(labelValue)
        ) {
            return '';
        }
        return `${labelValue}`;
    };
    return {
        ...input,
        styles: useStyles(input.control.value.uischema),
        appliedOptions,
        childLabelForIndex,
        computedLabel,
    };
};
