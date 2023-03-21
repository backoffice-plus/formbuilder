<template>

  <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
  >

    <input type="range"
           v-model="current"
           :step="control.schema.multipleOf || 1"
           :min="control.schema.minimum"
           :max="control.schema.maximum"
           :id="control.id + '-input'"
           :class="styles.control.input"
           :disabled="!control.enabled"
           :autofocus="appliedOptions.focus"
           :placeholder="appliedOptions.placeholder"
           :required="control.required"
           @change="onChange"
           @focus="isFocused = true"
           @blur="isFocused = false"
    />

    <span>{{ current }}</span>

  </control-wrapper>

</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {rankWith, isRangeControl,} from '@jsonforms/core';
import type {ControlElement, JsonFormsRendererRegistryEntry,} from '@jsonforms/core';
import {rendererProps, useJsonFormsControl,} from '@jsonforms/vue';
import type {RendererProps,} from '@jsonforms/vue';
import {ControlWrapper} from "@jsonforms/vue-vanilla";
import {useBoPlusVanillaControl} from "./utils";

/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/controls/SliderControlRenderer.vue
 */

const controlRenderer = defineComponent({
  name: 'slider-control-renderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  data() {
    return {
      current: null,
    }
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useBoPlusVanillaControl(useJsonFormsControl(props), (value) => Number(value.value));

    return {
      ...control,
    }
  },
  mounted() {
    if(undefined !== this.control.data) {
      this.current = this.control.data
    }
    else {
      this.current = this.control.schema.default;
      this.onChange({target:{value:this.control.schema.default}});//:INFO default value should always be set
    }
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, isRangeControl),
};
</script>
