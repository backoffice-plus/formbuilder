<template>
  <div>

    <TabGroup  as="template">

      <TabList class="tabs">

        <Tab
            v-for="(element, index) in visibleCategories"
            as="div"
            :key="`tab-${index}`"
            v-slot="{ selected }"
        >
          <!--
          :TODO add translation
  "type": "Category",
  "label": "categoryLabelKey",
  "i18n": "address",
          -->
          <button :class="{selected:selected}">   {{ element.i18n ?? element.label }}</button>

        </Tab>

      </TabList>

      <TabPanels>

        <TabPanel
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
          />

        </TabPanel>
      </TabPanels>
    </TabGroup>

  </div>

</template>

<script lang="ts">
import {
  isVisible,
  JsonFormsRendererRegistryEntry, Layout,
  rankWith,
  createAjv, Category, Categorization
} from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsLayout, RendererProps, DispatchRenderer } from '@jsonforms/vue';
import { useVanillaLayout } from '@jsonforms/vue-vanilla/src/util';
import { uiTypeIs} from "@jsonforms/core/src/testers/testers";

import {TabGroup, TabList, Tab, TabPanels, TabPanel} from '@headlessui/vue'

const controlRenderer = defineComponent({
  name: 'tabs-categorization-renderer',
  methods: {isVisible},
  components: {
    DispatchRenderer,
    TabGroup, TabList, Tab, TabPanels, TabPanel
  },
  props: {
    ...rendererProps<Layout>()
  },

  /**
   * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/layouts/CategorizationRenderer.vue
   */
  setup(props: RendererProps<Layout>) {

     const ajv = createAjv();

    return {
      ...useVanillaLayout(useJsonFormsLayout(props)),
      ajv
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
