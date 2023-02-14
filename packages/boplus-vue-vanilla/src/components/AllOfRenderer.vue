<template>

  <!--  :class="styles.allOf.root" -->
  <div class="allOf" v-if="control.visible">

    <template v-if="delegateUISchema">
      <dispatch-renderer
          :schema="control.schema"
          :uischema="delegateUISchema"
          :path="control.path"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
      />
    </template>

    <template v-else-if="allOfRenderInfos">
      <div>
        <CompinatorProperties
            :schema="control.schema"
            combinatorKeyword="allOf"
            :path="control.path"
        />
        <dispatch-renderer
            v-for="(allOfRenderInfo, allOfIndex) in allOfRenderInfos"
            :key="`${control.path}-${allOfIndex}`"
            :schema="allOfRenderInfo.schema"
            :uischema="allOfRenderInfo.uischema"
            :path="control.path"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
        />
      </div>
    </template>

  </div>

</template>


<script setup lang="ts">
import {computed, defineComponent} from 'vue';
import {
  createCombinatorRenderInfos,
  findMatchingUISchema, isAllOfControl,
  rankWith

} from '@jsonforms/core';
import type {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  UISchemaElement,
  CombinatorSubSchemaRenderInfo
} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsAllOfControl, useJsonFormsControlWithDetail} from '@jsonforms/vue';
import type {RendererProps} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import CompinatorProperties from "./CompinatorProperties.vue";



/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/AllOfRenderer.vue
 */
const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsAllOfControl(props)) as any
const control = input.control.value as any;

const delegateUISchema = computed((): UISchemaElement => {
  return findMatchingUISchema(control.uischemas)(
      control.schema,
      control.uischema.scope,
      control.path
  );
});

const allOfRenderInfos =  computed((): CombinatorSubSchemaRenderInfo[] => {
  const result = createCombinatorRenderInfos(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      control.schema.allOf!,
      control.rootSchema,
      'allOf',
      control.uischema,
      control.path,
      control.uischemas
  );
  return result.filter((info) => info.uischema);
});

</script>
