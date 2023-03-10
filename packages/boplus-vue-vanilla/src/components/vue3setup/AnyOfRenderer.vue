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


<script setup lang="ts">
import type {CombinatorSubSchemaRenderInfo, ControlElement} from '@jsonforms/core';
import {createCombinatorRenderInfos} from '@jsonforms/core';
import {computed, ref} from 'vue';
import {DispatchRenderer, rendererProps, useJsonFormsAnyOfControl} from '@jsonforms/vue';
import {useVanillaControl} from "@jsonforms/vue-vanilla";

/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/AnyOfRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsAnyOfControl(props)) as any
const control = input.control.value as any;

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
</script>
