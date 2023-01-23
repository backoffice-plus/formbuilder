<template>

  <div class="border border-black p-4 ">
    :TODO ArrayControlRenderer
  </div>

</template>


<script lang="ts">
import {defineComponent} from 'vue';
import type {ControlElement, JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {isObjectArrayControl, isPrimitiveArrayControl, or, rankWith} from '@jsonforms/core';
import type {RendererProps} from '@jsonforms/vue';
import {DispatchRenderer, rendererProps} from '@jsonforms/vue';

const allOfRenderer = defineComponent({
  name: 'array-control-renderer',
  components: {DispatchRenderer},
  props: {
    ...rendererProps<ControlElement>()
  },

  /**
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/ArrayControlRenderer.vue
   */
  setup(props: RendererProps<ControlElement>) {
      return {}
  }
});

export default allOfRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: allOfRenderer,
  //tester: rankWith(3, or(isObjectArrayControl, isPrimitiveArrayControl))
  //:TODO enable ArrayControl
  tester: rankWith(3, ()=>false)
};
</script>
