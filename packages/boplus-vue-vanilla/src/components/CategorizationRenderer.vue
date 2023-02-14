<template>

  <!--  :class="styles.categorization.root" -->
  <div class="categorization">

    <!--  :class="styles.categorization.category" -->
    <div class="tabs">

      <div
          v-for="(item, index) in categories"
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
        <button
            :class="{selected:selected===index}"
            :disabled="!item.isEnabled"
        >
          {{ item.element.i18n ?? item.element.label }}
        </button>

      </div>

    </div>

    <!--  :class="styles.categorization.panel" -->
    <div class="panel">

      <template
          v-for="(item, index) in categories"
          :key="`panel-${index}`"
      >
        <dispatch-renderer
            :schema="layout.schema"
            :uischema="item.element"
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


<script setup lang="ts">
import {
  isVisible,
  rankWith,
  createAjv, isEnabled
} from '@jsonforms/core';
import type {
  JsonFormsRendererRegistryEntry, Layout, Category, Categorization
} from '@jsonforms/core';
import {computed, defineComponent, ref} from 'vue';
import type {Ref} from 'vue';
import {rendererProps, useJsonFormsLayout, DispatchRenderer} from '@jsonforms/vue';
import type {RendererProps} from '@jsonforms/vue';
import {useVanillaLayout} from '@jsonforms/vue-vanilla/src/util';
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

const props = defineProps(rendererProps<Layout>());

const layoutData = useVanillaLayout(useJsonFormsLayout(props)) as any;
const layout = layoutData.layout as Ref<any>;


/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/layouts/CategorizationRenderer.vue
 */

const selected = ref(0);
const ajv = createAjv();

const categories = computed((): any => {
  return (layout.value.uischema as Categorization).elements
      .filter((category: Category | Categorization) => isVisible(category, layout.value.data, layout.value.path, ajv))
      .map((category: Category | Categorization) => {
        return {
          element: category,
          isEnabled: isEnabled(category, layout.value.data, layout.value.path, ajv)
        }
      });
});

</script>
