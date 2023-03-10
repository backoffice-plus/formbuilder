<template>

  <div v-if="control.visible">

    <!-- CombinatorProperties -->
    <CombinatorProperties
        :schema="control.schema"
        combinatorKeyword="anyOf"
        :path="path"
    />

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
        >

          <dispatch-renderer
              v-if="selectedIndex === anyOfIndex"
              :schema="anyOfRenderInfo.schema"
              :uischema="anyOfRenderInfo.uischema"
              :path="control.path"
              :renderers="control.renderers"
              :cells="control.cells"
              :enabled="control.enabled"
              :key="`${control.path}-${anyOfIndex}`"
          />

        </template>

      </div>

    </div>
  </div>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {createCombinatorRenderInfos, isAnyOfControl, rankWith} from '@jsonforms/core';
import type {CombinatorSubSchemaRenderInfo, ControlElement, JsonFormsRendererRegistryEntry} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsAnyOfControl,} from '@jsonforms/vue2';
import type {RendererProps} from '@jsonforms/vue2';
import {useVanillaControl} from "@jsonforms/vue2-vanilla";
import CombinatorProperties from "./components/CombinatorProperties.vue";

const controlRenderer = defineComponent({
  name: 'any-of-renderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAnyOfControl(props);
    const control = (input.control as any).value as typeof input.control;
    const selectedIndex = ref(control.indexOfFittingSchema || 0);
    return {
      ...useVanillaControl(input),
      selectedIndex,
    };
  },
  computed: {
    anyOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      const result = createCombinatorRenderInfos(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.control.schema.anyOf!,
          this.control.rootSchema,
          'anyOf',
          this.control.uischema,
          this.control.path,
          this.control.uischemas
      );
      return result.filter((info) => info.uischema);
    },
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, isAnyOfControl),
};
</script>
