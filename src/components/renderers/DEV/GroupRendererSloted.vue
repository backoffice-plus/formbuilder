<template>

  <fieldset v-if="layout.visible" :class="styles.group.root">

    <legend v-if="layout.label" :class="styles.group.label">

      <slot name="header" :label="layout.label">
        {{ layout.label }}
      </slot>

    </legend>

    <slot />

    <div
        v-for="(element, index) in layout.uischema.elements"
        :key="`${layout.path}-${index}`"
        :class="styles.group.item"
    >
      <DispatchRenderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
      />
    </div>
  </fieldset>
</template>

<script lang="ts">
import {
  type JsonFormsRendererRegistryEntry,
  type Layout,
  rankWith,
  and,
  isLayout,
  uiTypeIs,
} from '@jsonforms/core';
import { defineComponent } from 'vue';
import { useVanillaLayout} from '@jsonforms/vue-vanilla';
import {useJsonFormsLayout, rendererProps, DispatchRenderer, type RendererProps} from "@jsonforms/vue";

const layoutRenderer = defineComponent({
  name: 'GroupRendererSloted',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    return useVanillaLayout(useJsonFormsLayout(props));
  },
});

export default layoutRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(2, and(isLayout, uiTypeIs('GroupSloted'))),
};
</script>
