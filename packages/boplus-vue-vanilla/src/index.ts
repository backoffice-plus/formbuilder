import CategorizationRenderer from "./components/CategorizationRenderer.vue";
import AllOfRenderer from "./components/AllOfRenderer.vue";
import AnyOfRenderer from "./components/AnyOfRenderer.vue";
import OneOfRenderer from "./components/OneOfRenderer.vue";
import ObjectRenderer from "./components/ObjectRenderer.vue";
import EnumArrayRenderer from "./components/EnumArrayRenderer.vue";
import ArrayControlRenderer from "./components/ArrayControlRenderer.vue";
import ArrayLayoutRenderer from "./components/ArrayLayoutRenderer.vue";
import BooleanToggleControlRenderer from "./components/BooleanToggleControlRenderer.vue";
import RadioGroupControlRenderer from "./components/RadioGroupControlRenderer.vue";
import SliderControlRenderer from "./components/SliderControlRenderer.vue";
import PasswordControlRenderer from "./components/PasswordControlRenderer.vue";

import {
    and,
    or,
    categorizationHasCategory,
    hasType,
    isAllOfControl,
    isOneOfControl,
    isAnyOfControl,
    isObjectControl,
    isObjectArrayControl,
    isPrimitiveArrayControl,
    rankWith,
    schemaMatches,
    schemaSubPathMatches,
    isObjectArrayWithNesting,
    isBooleanControl,
    optionIs,
    isEnumControl,
    isOneOfEnumControl, isRangeControl, isStringControl, formatIs, schemaTypeIs, isObjectArray
} from "@jsonforms/core";
import type {JsonSchema} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

export const categorizationRendererEntry = {
    renderer: CategorizationRenderer,
    tester: rankWith(2, and(uiTypeIs('Categorization'), categorizationHasCategory))
};

export const objectRendererEntry = {
    renderer: ObjectRenderer,
    tester: rankWith(3, isObjectControl)
};

export const allOfRendererEntry = {
    renderer: AllOfRenderer,
    tester: rankWith(3, isAllOfControl)
};
export const anyOfRendererEntry = {
    renderer: AnyOfRenderer,
    tester: rankWith(3, isAnyOfControl)
};
export const OneOfRendererEntry = {
    renderer: OneOfRenderer,
    tester: rankWith(2, isOneOfControl)
};

const hasOneOfItems = (schema: JsonSchema): boolean => (schema?.oneOf ?? [] as JsonSchema[]).every((entry: JsonSchema) => entry.const !== undefined);
const hasEnumItems = (schema: JsonSchema): boolean => schema.type === 'string' && schema.enum !== undefined;

export const enumArrayRendererEntry = {
    renderer: EnumArrayRenderer,
    tester: rankWith(5,
        and(
            uiTypeIs('Control'),
            and(
                schemaMatches((schema) => hasType(schema, 'array') && !Array.isArray(schema.items) && schema.uniqueItems === true),
                schemaSubPathMatches('items', (schema) => hasOneOfItems(schema) || hasEnumItems(schema))
            )
        ))
};


export const booleanToggleControlRendererEntry = {
    renderer: BooleanToggleControlRenderer,
    tester: rankWith(3, and(isBooleanControl, optionIs('toggle', true))),
};

export const radioGroupControlRendererEntry = {
    renderer: RadioGroupControlRenderer,
    tester: rankWith(20, and(or(isEnumControl, isOneOfEnumControl), optionIs('format', 'radio'))),
};

export const sliderControlRendererEntry = {
    renderer: SliderControlRenderer,
    tester: rankWith(4, isRangeControl),
};
export const passwordControlRendererEntry = {
    renderer: PasswordControlRenderer,
    tester: rankWith(2, and(isStringControl, formatIs('password'))),
};

export const boplusVueVanillaRenderers = [
    categorizationRendererEntry,
    OneOfRendererEntry,
    allOfRendererEntry,
    anyOfRendererEntry,
    objectRendererEntry,
    enumArrayRendererEntry,
    booleanToggleControlRendererEntry,
    radioGroupControlRendererEntry,
    sliderControlRendererEntry,
    passwordControlRendererEntry,
];

boplusVueVanillaRenderers.push({
    renderer: ArrayControlRenderer,
    tester: rankWith(4, or(isObjectArrayControl, isPrimitiveArrayControl))
});

boplusVueVanillaRenderers.push({
    renderer: ArrayLayoutRenderer,
    tester: rankWith(3, schemaTypeIs('array'))
});

boplusVueVanillaRenderers.push({
    renderer: ArrayLayoutRenderer,
    tester: rankWith(5, or(isObjectArrayWithNesting, and(uiTypeIs('ListWithDetail'), isObjectArray)))
});
