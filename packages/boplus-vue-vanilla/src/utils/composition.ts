import _ from "lodash";
import {computed, inject, provide} from 'vue';
import type {ComputedRef} from 'vue';
import {composePaths, computeLabel, getFirstPrimitiveProp, Resolve} from "@jsonforms/core";
import type {NestedInfo} from "./composition.type";

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

export const childLabelForIndex = (input:any, index: number | null) => {
    if (index === null) {
        return '';
    }
    const childLabelProp =
        input.control.value.uischema.options?.childLabelProp ??
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
