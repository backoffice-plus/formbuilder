import _ from "lodash";
import {defaultStyles} from '../../utils';
export * from '../../utils/composition';
import {useComputedLabel, useControlAppliedOptions, childLabelForIndex as childLabelForIndexWithInput} from '../../utils/composition';
import {useStyles, useVanillaControl, useVanillaLayout} from "@jsonforms/vue-vanilla";

export const useBoPlusLayout = <I extends { layout: any }>(input: I) => {
    const layout = useVanillaLayout(input);
    const uischemaStyles = input.layout.value.uischema?.options?.styles;

    return {
        ...layout,
        styles: _.merge(layout.styles, defaultStyles, uischemaStyles ?? {}),
    };
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

    const childLabelForIndex = (index: number | null) => childLabelForIndexWithInput(input, index);

    return {
        ...input,
        styles: useStyles(input.control.value.uischema),
        appliedOptions,
        childLabelForIndex,
        computedLabel,
    };
};
