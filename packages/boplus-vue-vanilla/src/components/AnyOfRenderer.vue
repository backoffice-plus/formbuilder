<template>

  <!--  :class="styles.anyOf.root" -->
  <div class="categorization">

    <!--  :class="styles.anyOf.category" -->
    <div class="tabs">

      <div
          v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
          :key="`${control.path}-${anyOfIndex}`"
          @click="selectedIndex=anyOfIndex"
      >
        <!--  :class="styles.categorization.selected" -->
        <button :class="{selected:selectedIndex===anyOfIndex}">{{ anyOfRenderInfo.label }}</button>

      </div>

    </div>

    <!--  :class="styles.anyOf.panel" -->
    <div class="panel">

      <template
          v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos"
          :key="`${control.path}-${anyOfIndex}`"
      >
        <dispatch-renderer
            v-if="selectedIndex === anyOfIndex"
            :schema="anyOfRenderInfo.schema"
            :uischema="anyOfRenderInfo.uischema"
            :path="control.path"
            :renderers="control.renderers"
            :cells="control.cells"
            :enabled="control.enabled"
        />

      </template>

    </div>

  </div>

</template>


<script lang="ts">
import type {CombinatorSubSchemaRenderInfo, ControlElement, JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {createCombinatorRenderInfos, isAnyOfControl, isVisible, rankWith} from '@jsonforms/core';
import {computed, defineComponent, ref} from 'vue';
import type {RendererProps} from '@jsonforms/vue';
import {DispatchRenderer, rendererProps, useJsonFormsAnyOfControl} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";


const controlRenderer = defineComponent({
  name: 'tabs-categorization-renderer',
  methods: {isVisible},
  components: {DispatchRenderer},
  props: {
    ...rendererProps<ControlElement>()
  },

  /**
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/AnyOfRenderer.vue
   */
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAnyOfControl(props);
    const control = (input.control as any).value as typeof input.control;
    const selectedIndex = ref(control.indexOfFittingSchema || 0);

    const anyOfRenderInfos = computed((): CombinatorSubSchemaRenderInfo[] => {
      const result = createCombinatorRenderInfos(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          control.schema.anyOf!,
          control.rootSchema,
          'anyOf',
          control.uischema,
          control.path,
          control.uischemas
      );
      return result.filter((info) => info.uischema);
    })

    return {
      ...useVanillaControl(input),
      selectedIndex,
      anyOfRenderInfos
    };
  },
});

export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAnyOfControl)
};
</script>
