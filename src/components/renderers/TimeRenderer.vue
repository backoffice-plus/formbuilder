<template>
    <control-wrapper
        v-bind="controlWrapper"
        :styles="styles"
        :is-focused="isFocused"
        :applied-options="appliedOptions"
    >
        <input
            type="time"
            :id="control.id + '-input'"
            :class="styles.control.input"
            v-model="controlData"
            :disabled="!control.enabled"
            :autofocus="appliedOptions.focus"
            :placeholder="appliedOptions.placeholder"
            @change="onChange"
            @focus="isFocused = true"
            @blur="isFocused = false"
        />
      <!--
          using :value istn working, there are no changes at selecting a date at the nativ modal
          :value="control.data"

          use v-model="controlData" solves this
          -->
    </control-wrapper>
</template>

<script lang="ts">
import {rankWith, isTimeControl,} from '@jsonforms/core';
import type {ControlElement, JsonFormsRendererRegistryEntry,} from '@jsonforms/core';
import {defineComponent} from 'vue';
import {rendererProps, useJsonFormsControl} from "@jsonforms/vue";
import type {RendererProps,} from "@jsonforms/vue";
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";

const toISOString = (inputDateTime: string) => {
    return inputDateTime === '' ? undefined : inputDateTime + ':00.000Z';
};

const controlRenderer = defineComponent({
    name: 'TimeControlRenderer',
    components: {
        ControlWrapper,
    },
    props: {
        ...rendererProps<ControlElement>(),
    },
    data: () => {
        return {
            controlData: null,
        }
    },
    setup(props: RendererProps<ControlElement>) {
        return useVanillaControl(useJsonFormsControl(props), (target) => toISOString(target.value));
    },
    mounted() {
        this.controlData = (this.control.data ?? '');
    },
});

export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
    renderer: controlRenderer,
    tester: rankWith(10, isTimeControl),
};
</script>
