<template>

  <!--  :class="styles.categorization.root" -->
  <div class="categorization">

    <!--  :class="styles.categorization.category" -->
    <div class="tabs">

        <div
            v-for="(element, index) in visibleCategories"
            :key="`tab-${index}`"
            @click="selected=index"
        >
          <!--
          :TODO add translation
  "type": "Category",
  "label": "categoryLabelKey",
  "i18n": "address",
          -->

          <!--  :class="styles.categorization.selected" -->
          <button :class="{selected:selected===index}">   {{ element.i18n ?? element.label }}</button>

        </div>

      </div>

      <!--  :class="styles.categorization.panel" -->
      <div class="panel">

        <template
            v-for="(element, index) in visibleCategories"
            :key="`panel-${index}`"
        >
          <dispatch-renderer
              :schema="layout.schema"
              :uischema="element"
              :path="layout.path"
              :enabled="layout.enabled"
              :renderers="layout.renderers"
              :cells="layout.cells"
              v-if="selected===index"
          />

        </template>

      </div>

  </div>

</template>


<script lang="ts">
import {
  isVisible,
  rankWith,
  createAjv
} from '@jsonforms/core';
import type {
  JsonFormsRendererRegistryEntry, Layout, Category, Categorization
} from '@jsonforms/core';
import {defineComponent, ref} from 'vue';
import { rendererProps, useJsonFormsLayout, DispatchRenderer } from '@jsonforms/vue';
import type { RendererProps } from '@jsonforms/vue';
import { useVanillaLayout } from '@jsonforms/vue-vanilla/src/util';
import { uiTypeIs} from "@jsonforms/core/src/testers/testers";


const controlRenderer = defineComponent({
  name: 'tabs-categorization-renderer',
  methods: {isVisible},
  components: {DispatchRenderer},
  props: {
    ...rendererProps<Layout>()
  },

  /**
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/layouts/CategorizationRenderer.vue
   */
  setup(props: RendererProps<Layout>) {

    const selected = ref(0);

    const ajv = createAjv();

    return {
      ...useVanillaLayout(useJsonFormsLayout(props)),
      ajv,
      selected
    };
  },
  computed: {
    visibleCategories(): (Category | Categorization)[] {
      return (this.layout.uischema as Categorization).elements.filter(
          (category: Category | Categorization) =>
              isVisible(category, this.layout.data, this.layout.path, this.ajv)
      );
    },
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2,      uiTypeIs('Categorization')  )
};
</script>
