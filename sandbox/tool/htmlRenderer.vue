<template>
<!--  <control-wrapper-->
<!--      v-bind="controlWrapper"-->
<!--      :styles="styles"-->
<!--      :isFocused="isFocused"-->
<!--      :appliedOptions="appliedOptions"-->
<!--  >-->
    <div v-html="body" />

<!--  </control-wrapper>-->
</template>

<script lang="ts">
import type {ControlElement, JsonFormsRendererRegistryEntry,} from '@jsonforms/core';
import {rankWith,} from '@jsonforms/core';
import {defineComponent} from 'vue';
import type {RendererProps} from '@jsonforms/vue';
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {default as ControlWrapper} from '@jsonforms/vue-vanilla/src/controls/ControlWrapper.vue';
import {useVanillaControl} from '@jsonforms/vue-vanilla/src/util';
import {and, uiTypeIs} from "@jsonforms/core/src/testers/testers";

const htmlRenderer = defineComponent({
  name: 'html-renderer',
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    const c = useVanillaControl(useJsonFormsControl(props), target => target.value || undefined);
    return {
      ...c,
      body: c.appliedOptions.value?.body,
    };
  }
});

export default htmlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: htmlRenderer,
  tester: rankWith(2, uiTypeIs('Html'))
};
</script>
